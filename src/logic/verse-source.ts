/*
 * The VerseSource port: the single Obsidian/format boundary the output builders sit behind.
 * This module is pure and Obsidian-free so the heading-level / offset / line-scanning
 * heuristics can be unit-tested directly and a fake source can drive the builders.
 * The Obsidian-backed adapter lives in obsidian-verse-source.ts.
 */

/** The atom of scripture, addressed by its number within a chapter. */
export type Verse = { number: number; text: string; anchor: string };

/** Yields the verses of a chapter file, hiding how they are stored and read. */
export interface VerseSource {
	getChapterVerses(book: string, chapter: number, translation: string): Promise<Verse[]>;
}

/** The slice of an Obsidian HeadingCache the extractor needs (kept Obsidian-free). */
export type HeadingInfo = { heading: string; level: number; line: number };

/** Knobs the source applies when mapping a chapter file's headings to verses. */
export type ExtractOptions = { verseHeadingLevel: number; verseOffset: number };

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
