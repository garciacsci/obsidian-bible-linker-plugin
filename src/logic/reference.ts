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

/**
 * A bare verse chunk in the verse portion: "10", "10-12" (range separators: - . =), or a
 * range whose end carries its own chapter, "27-2:2" — the end's "chapter:" prefix lets a
 * range cross a chapter boundary within the book. Groups: startVerse, endChapter?, endVerse.
 */
const verseChunkRegEx = /^(\d+)(?:\s*[-.=]\s*(?:(\d+)\s*[:.]\s*)?(\d+))?$/;

/** A bookless ";" segment, "3:15": a chapter switch that keeps the running book. */
const chapterSwitchRegEx = /^(\d+)\s*[:.,#]\s*(.+)$/;

/**
 * Parses a user-typed reference into an ordered list of segments.
 * Pure: throws on malformed input, never shows a Notice (callers do that).
 *
 * The reference is split on ";" into parts, each carrying its own book and chapter. A part
 * either restates the book ("Rom 5:8") or, when bookless ("3:15"), keeps the running book and
 * only switches chapter — so a ";" may cross a book or a chapter boundary. Crossing a book is
 * only ever separate segments, never a single range. Within a part the leading chapter:verse
 * separator is consumed, then "," splits same-chapter chunks (one segment each): this makes ","
 * do double duty exactly as users write it — in "Gen 1,1" the first comma is the chapter:verse
 * separator, while in "Gen 1:1-3,10-12" the colon takes that role and the comma separates chunks.
 *
 * @param input Raw reference, e.g. "Gen 1:1", "Gen 1:1-3,10-12", "John 3:16; Rom 5:8".
 * @param settings Plugin settings (reserved for forward-compat; unused this slice).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function parseReference(input: string, settings: PluginSettings): Reference {
	const segments: Reference = [];
	let runningBook: string | undefined;

	for (const rawPart of input.split(";")) {
		const part = rawPart.trim();
		let book: string;
		let chapter: number;
		let rest: string;

		const bookAndChapter = part.match(bookAndChapterRegEx);
		if (bookAndChapter) {
			// A part that names its own book: "Gen 1:1-3", "Rom 5:8".
			book = bookAndChapter[1];
			chapter = Number(bookAndChapter[2]);
			rest = part
				.slice(bookAndChapter.index + bookAndChapter[0].length)
				.replace(/^\s*[,:.;#]\s*/, "");
			runningBook = book;
		} else {
			// A bookless chapter switch, "3:15": keep the running book, switch chapter.
			const chapterSwitch = part.match(chapterSwitchRegEx);
			if (!chapterSwitch || runningBook === undefined) {
				throw "Could not parse user input";
			}
			book = runningBook;
			chapter = Number(chapterSwitch[1]);
			rest = chapterSwitch[2];
		}

		for (const rawChunk of rest.split(",")) {
			const chunk = rawChunk.trim().match(verseChunkRegEx);
			if (!chunk) {
				throw "Could not parse user input";
			}
			const startVerse = Number(chunk[1]);
			const endVerse = chunk[3] !== undefined ? Number(chunk[3]) : startVerse;
			const range: Range =
				chunk[2] !== undefined
					? { startVerse, endChapter: Number(chunk[2]), endVerse }
					: { startVerse, endVerse };
			segments.push({ book, chapter, range });
		}
	}

	return segments;
}
