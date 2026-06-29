/*
 * The VerseSource port: the single Obsidian/format boundary the output builders sit behind.
 * This module is pure and Obsidian-free so the heading-level / offset / line-scanning
 * heuristics can be unit-tested directly and a fake source can drive the builders.
 * The Obsidian-backed adapter lives in obsidian-verse-source.ts.
 */

/** The atom of scripture, addressed by its number within a chapter. */
export type Verse = { number: number; text: string; anchor: string };

/**
 * A resolved chapter file: its link-target name (as actually found on disk, e.g. "Gen 1"
 * or the OBSK "Gen-01") plus the verses it holds. The fileName is what links point at, so
 * the builders can target the same file the text was read from.
 *
 * `sectionStarts` lists the verse numbers at which a section ("## " pericope heading) begins,
 * so an open-ended "f" range can stop at the next section. Absent/empty when the chapter file
 * marks no sections (or the vault has not configured a section heading level).
 */
export type Chapter = { fileName: string; verses: Verse[]; sectionStarts?: number[] };

/** Yields a resolved chapter file, hiding how it is named, stored, and read. */
export interface VerseSource {
	getChapter(book: string, chapter: number, translation: string): Promise<Chapter>;
}

/** The slice of an Obsidian HeadingCache the extractor needs (kept Obsidian-free). */
export type HeadingInfo = { heading: string; level: number; line: number };

/**
 * Knobs the source applies when mapping a chapter file's headings to verses.
 * `sectionHeadingLevel` (optional) is the heading level used for section/pericope titles; when
 * unset, the chapter is treated as one section (so "f" behaves like "ff", running to chapter end).
 */
export type ExtractOptions = {
	verseHeadingLevel: number;
	verseOffset: number;
	sectionHeadingLevel?: number;
};

/**
 * Turns a chapter file's raw lines and headings into an ordered list of verses.
 *
 * Mirrors the legacy inline extraction exactly so output stays byte-for-byte identical:
 * headings are first filtered to the verse heading level, then verse number `v` maps to
 * heading index `v + verseOffset` (index 0 being the chapter title when verseOffset is 0).
 *
 * @returns Verses keyed by their real (display) number; text is the verse's content lines
 *          joined with "\n", leaving line/space formatting to the caller.
 */
export function extractChapterVerses(
	lines: string[],
	headings: HeadingInfo[],
	options: ExtractOptions
): Verse[] {
	const { verseHeadingLevel, verseOffset } = options;
	const verseHeadings = headings.filter(
		(heading) => !verseHeadingLevel || heading.level === verseHeadingLevel
	);
	const nrOfVerses = verseHeadings.length - 1 - verseOffset;

	const verses: Verse[] = [];
	for (let number = 1; number <= nrOfVerses; number++) {
		const index = number + verseOffset;
		verses.push({
			number,
			anchor: verseHeadings[index].heading,
			text: extractVerseText(index, verseHeadings, lines),
		});
	}
	return verses;
}

/**
 * Finds the verse numbers at which a section begins — one per section heading (a heading at
 * `sectionHeadingLevel`), namely the number of the first verse that follows it. Assumes the verse
 * headings are filtered out by `verseHeadingLevel` so section headings are distinguishable; returns
 * an empty list when no section level is configured.
 *
 * Uses the same verse↔heading mapping as extractChapterVerses (verse `n` lives at heading index
 * `n + verseOffset`), inverted to turn a heading index back into its verse number.
 */
export function extractSectionStarts(headings: HeadingInfo[], options: ExtractOptions): number[] {
	const { verseHeadingLevel, verseOffset, sectionHeadingLevel } = options;
	if (!sectionHeadingLevel) {
		return [];
	}
	const verseHeadings = headings.filter(
		(heading) => !verseHeadingLevel || heading.level === verseHeadingLevel
	);
	const nrOfVerses = verseHeadings.length - 1 - verseOffset;

	const starts: number[] = [];
	for (const heading of headings) {
		if (heading.level !== sectionHeadingLevel) {
			continue;
		}
		// The section introduces the first verse heading that comes after it.
		const index = verseHeadings.findIndex((verse) => verse.line > heading.line);
		const number = index - verseOffset;
		if (index !== -1 && number >= 1 && number <= nrOfVerses) {
			starts.push(number);
		}
	}
	return starts;
}

/**
 * The last verse of the section that contains `startVerse`: the verse just before the next section
 * begins, or the chapter's last verse when no later section follows (or none are marked). This is
 * what an open-ended "f" range resolves its end verse to.
 */
export function sectionEndVerse(chapter: Chapter, startVerse: number): number {
	const next = (chapter.sectionStarts ?? []).find((verse) => verse > startVerse);
	return next !== undefined ? next - 1 : chapter.verses.length;
}

/**
 * Collects the content lines that follow a verse heading, stopping at the next heading or
 * at a blank line after content (leading blank lines are skipped). Lines are joined with
 * "\n"; the caller decides whether to render those as newlines or spaces.
 */
function extractVerseText(headingIndex: number, headings: HeadingInfo[], lines: string[]): string {
	const headingLine = headings[headingIndex].line;
	let output = "";
	let isFirst = true;
	let i = 1;

	while (headingLine + i < lines.length) {
		const line = lines[headingLine + i];
		if (/^#/.test(line) || (!line && !isFirst)) {
			break; // next verse heading, or the blank line that ends this verse
		}
		i++;
		if (line) {
			if (!isFirst) {
				output += "\n";
			}
			isFirst = false;
			output += line;
		}
	}
	return output;
}
