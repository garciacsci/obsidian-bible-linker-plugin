/*
 * Pure, Obsidian-free parser for user-typed scripture references.
 * Replaces parseUserVerseInput; both commands consume it.
 */
import { bookAndChapterRegEx, multipleVersesRegEx, oneVerseRegEx } from "../utils/regexes";
import type { PluginSettings } from "../main";

/** The verse span inside a segment. May cross a chapter boundary (endChapter), never a book. */
export type Range = { startVerse: number; endVerse: number; endChapter?: number };

/** One contiguous, self-contained piece of a reference: book + chapter + verse range. */
export type Segment = { book: string; chapter: number; range: Range };

/** A parsed reference: an ordered list of segments. */
export type Reference = Segment[];

/**
 * Parses a user-typed reference into an ordered list of segments.
 * Pure: throws on malformed input, never shows a Notice (callers do that).
 * @param input Raw reference string, e.g. "Gen 1:1" or "Gen 1,1-5".
 * @param settings Plugin settings (reserved for forward-compat; unused this slice).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function parseReference(input: string, settings: PluginSettings): Reference {
	// Precedence mirrors the legacy parseUserVerseInput: one-verse first, then range.
	const oneVerse = input.match(oneVerseRegEx);
	if (oneVerse) {
		const [, bookAndChapter, verse] = oneVerse;
		const verseNum = Number(verse);
		return [toSegment(bookAndChapter, verseNum, verseNum)];
	}
	const range = input.match(multipleVersesRegEx);
	if (range) {
		const [, bookAndChapter, beginVerse, endVerse] = range;
		return [toSegment(bookAndChapter, Number(beginVerse), Number(endVerse))];
	}
	throw "Could not parse user input";
}

/** Splits a "book chapter" string (e.g. "Gen 1", "1 Cor 13") into a segment. */
function toSegment(bookAndChapter: string, startVerse: number, endVerse: number): Segment {
	const [, book, chapter] = bookAndChapter.match(bookAndChapterRegEx);
	return { book, chapter: Number(chapter), range: { startVerse, endVerse } };
}
