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
 * A section heading glued onto the end of a verse (see splitGluedHeading) is removed from its text.
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
			text: splitGluedHeading(extractVerseText(index, verseHeadings, lines)).text,
		});
	}
	return verses;
}

/**
 * Finds the verse numbers at which a section begins — one per section heading (a heading at
 * `sectionHeadingLevel`), namely the number of the first verse that follows it. Assumes the verse
 * headings are filtered out by `verseHeadingLevel` so section headings are distinguishable.
 *
 * When the chapter's `lines` are given, a section heading glued onto the end of a verse (see
 * splitGluedHeading) also starts a section at the next verse, whether or not a section level is
 * configured. The result is sorted and has no duplicates; it is empty when neither source marks a
 * section.
 *
 * Uses the same verse↔heading mapping as extractChapterVerses (verse `n` lives at heading index
 * `n + verseOffset`), inverted to turn a heading index back into its verse number.
 */
export function extractSectionStarts(
	headings: HeadingInfo[],
	options: ExtractOptions,
	lines?: string[]
): number[] {
	const { verseHeadingLevel, verseOffset, sectionHeadingLevel } = options;
	const verseHeadings = headings.filter(
		(heading) => !verseHeadingLevel || heading.level === verseHeadingLevel
	);
	const nrOfVerses = verseHeadings.length - 1 - verseOffset;

	const starts = new Set<number>();
	if (sectionHeadingLevel) {
		for (const heading of headings) {
			if (heading.level !== sectionHeadingLevel) {
				continue;
			}
			// The section introduces the first verse heading that comes after it.
			const index = verseHeadings.findIndex((verse) => verse.line > heading.line);
			const number = index - verseOffset;
			if (index !== -1 && number >= 1 && number <= nrOfVerses) {
				starts.add(number);
			}
		}
	}

	// A heading glued onto the end of verse n starts a section at verse n + 1. One glued onto the
	// chapter's last verse opens the next chapter, so it adds nothing here.
	if (lines) {
		for (let number = 1; number < nrOfVerses; number++) {
			const text = extractVerseText(number + verseOffset, verseHeadings, lines);
			if (splitGluedHeading(text).heading !== undefined) {
				starts.add(number + 1);
			}
		}
	}
	return [...starts].sort((a, b) => a - b);
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

/*
 * Glued section headings. The Bible Gateway export writes a section heading onto the end of the
 * verse before it, with no separator and no heading line: "...eternal life.For God So Loved the
 * World". Real verse text never puts a capital letter directly after closing punctuation, so that
 * join is the signal. The detector is conservative: the glued text must run to the end of the
 * verse's last line and be in title case, or the verse is left as it is.
 */

// Where verse text ends and a heading begins: closing punctuation, then any closing quotes,
// brackets or italic marks ("_"), then the heading's capital letter with no space. NKJV spaces
// its nested closing quotes (`.' "` or `." ' "`), so a space is allowed between two quotes, but
// never straight after the punctuation: `, "Hosanna` is an opening quote, not a heading.
// Also ")" or "]" straight after a word.
const GLUE = /(?:[.?!;:,](?:[)\]"'’”_]|(?<=["'’”]) (?=["'’”]))*|[a-z][)\]]+)(?=["“]?[A-Z])/g;

// The heading itself, to the end of the line: words, digits and heading punctuation, an optional
// final "?" or "!", and an optional " [" / " [[" that opens a bracketed passage in the next verse.
const HEADING = /^(["“]?[A-Z][A-Za-z0-9’'\-–—,:;()"“” ]*?[?!]?["”]?)( \[\[?)?(\s*)$/;

// Words a title-case heading may leave in lower case.
const MINOR_WORDS = new Set(
	(
		"a an the and but or nor for of in on at to by with from into upon as over than under after " +
		"before through about against among between without like concerning off out up down so yet"
	).split(" ")
);

function isTitleCase(heading: string): boolean {
	return heading.split(/\s+/).every((raw) => {
		const word = raw.replace(/^["“”(),:;?!]+|["“”(),:;?!]+$/g, "");
		return !word || /^[A-Z0-9]/.test(word) || MINOR_WORDS.has(word.toLowerCase());
	});
}

/**
 * Splits a section heading glued onto the end of a verse's text off that text. Only the last line
 * is examined. Returns the text unchanged, with no `heading`, when no glued heading is found.
 * Whitespace after the heading, and a " [[" that belongs to the next verse, stay in the text.
 */
export function splitGluedHeading(text: string): { text: string; heading?: string } {
	const lastLineStart = text.lastIndexOf("\n") + 1;
	const lastLine = text.slice(lastLineStart);
	for (const glue of lastLine.matchAll(GLUE)) {
		const end = (glue.index ?? 0) + glue[0].length;
		const match = HEADING.exec(lastLine.slice(end));
		// After spaced quotes, a closing quote may be followed by a new quotation, not a heading
		// ("So many!" "Silence!"), so a heading there must not itself end like speech.
		const afterSpacedQuotes = glue[0].includes(" ");
		if (match && isTitleCase(match[1]) && !(afterSpacedQuotes && /[?!"“”]/.test(match[1]))) {
			return {
				text: text.slice(0, lastLineStart + end) + (match[2] ?? "") + match[3],
				heading: match[1],
			};
		}
	}
	return { text };
}
