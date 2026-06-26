/*
 * Pure, Obsidian-free parser for user-typed scripture references.
 * Replaces parseUserVerseInput; both commands consume it.
 */
import { bookAndChapterRegEx } from "../utils/regexes";
import type { PluginSettings } from "../main";

/** The verse span inside a segment. May cross a chapter boundary (endChapter), never a book. */
export type Range = { startVerse: number; endVerse: number; endChapter?: number };

/** One contiguous, self-contained piece of a reference: book + chapter + verse range. */
export type Segment = { book: string; chapter: number; range: Range };

/** A parsed reference: an ordered list of segments. */
export type Reference = Segment[];

/** A bare verse chunk in the verse portion: "10", "10-12" (range separators: - . =). */
const verseChunkRegEx = /^(\d+)(?:\s*[-.=]\s*(\d+))?$/;

/**
 * Parses a user-typed reference into an ordered list of segments.
 * Pure: throws on malformed input, never shows a Notice (callers do that).
 *
 * Reads the leading book + chapter, consumes the first chapter:verse separator, then splits
 * the rest on "," into same-chapter chunks (one segment each). This makes "," do double duty
 * exactly as users write it: in "Gen 1,1" the first comma is the chapter:verse separator, while
 * in "Gen 1:1-3,10-12" the colon takes that role and the comma separates chunks. Following
 * chunks inherit the book and chapter of the chunk before them.
 *
 * @param input Raw reference string, e.g. "Gen 1:1", "Gen 1,1-5", or "Gen 1:1-3,10-12".
 * @param settings Plugin settings (reserved for forward-compat; unused this slice).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function parseReference(input: string, settings: PluginSettings): Reference {
	const bookAndChapter = input.match(bookAndChapterRegEx);
	if (!bookAndChapter) {
		throw "Could not parse user input";
	}
	const [, book, chapter] = bookAndChapter;

	// Everything after the matched "book chapter": a leading chapter:verse separator then chunks.
	const rest = input
		.slice(bookAndChapter.index + bookAndChapter[0].length)
		.replace(/^\s*[,:.;#]\s*/, "");

	const segments: Reference = rest.split(",").map((rawChunk) => {
		const chunk = rawChunk.trim().match(verseChunkRegEx);
		if (!chunk) {
			throw "Could not parse user input";
		}
		const startVerse = Number(chunk[1]);
		const endVerse = chunk[2] !== undefined ? Number(chunk[2]) : startVerse;
		return { book, chapter: Number(chapter), range: { startVerse, endVerse } };
	});

	return segments;
}
