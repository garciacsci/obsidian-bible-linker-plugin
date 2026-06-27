/*
 * Pure, Obsidian-free parser for user-typed scripture references.
 * Replaces parseUserVerseInput; both commands consume it.
 */
import type { PluginSettings } from "../main";

/** The verse span inside a segment. May cross a chapter boundary (endChapter), never a book. */
export type Range = { startVerse: number; endVerse: number; endChapter?: number };

/** One contiguous, self-contained piece of a reference: book + chapter + verse range. */
export type Segment = { book: string; chapter: number; range: Range };

/** A parsed reference: an ordered list of segments. */
export type Reference = Segment[];

/** Escapes the characters that are special inside a regex character class. */
function escapeForCharClass(chars: string): string {
	return chars.replace(/[\]\\^-]/g, "\\$&");
}

/**
 * Builds the chapter↔verse separator regexes from the configured separator characters. The
 * configured set (default ":.") sets which characters separate a chapter from its verse portion
 * — both for a book-bearing part ("Gen 1:1") and a bookless chapter switch ("3:15"). The legacy
 * "," single-chunk form ("Gen 1,1") is always retained on the leading separator. A cross-chapter
 * range end ("27-2:2") uses the configured set alone — "," can't appear there since it splits chunks.
 */
function separatorRegexes(separators: string) {
	const configured = [...new Set(separators.split(""))].join("");
	const leadClass = escapeForCharClass([...new Set((configured + ",").split(""))].join(""));
	const chunkClass = escapeForCharClass(configured);
	// A book name never contains a chapter:verse separator, "," or "#"; excluding the configured
	// separators here stops the greedy book match from swallowing past them (e.g. with "/" as the
	// separator, "Gen 1/1-3" must split book "Gen" chapter "1", not book "Gen 1/1" chapter "3").
	const bookClass = escapeForCharClass([...new Set((",:#" + configured).split(""))].join(""));
	return {
		// A part naming its own book: "Gen 1:1-3", "Rom 5:8". Groups: book, chapter. Anchored to
		// the part's start so a bookless chapter switch carrying a range ("12:1-6") isn't misread
		// as book "1" chapter "6" — the range's "-" must not be mistaken for a book/chapter divider.
		bookAndChapterRegEx: new RegExp(`^([^${bookClass}]*\\S)[-|\\s]+(\\d+)`),
		// The leading chapter:verse separator consumed after a part's "Book Chapter".
		leadingSeparatorRegEx: new RegExp(`^\\s*[${leadClass}]\\s*`),
		// A bookless ";" segment, "3:15": a chapter switch that keeps the running book.
		chapterSwitchRegEx: new RegExp(`^(\\d+)\\s*[${leadClass}]\\s*(.+)$`),
		// A bare verse chunk: "10", "10-12" (range separators: - . =), or a range whose end
		// carries its own chapter, "27-2:2" — groups: startVerse, endChapter?, endVerse.
		verseChunkRegEx: new RegExp(`^(\\d+)(?:\\s*[-.=]\\s*(?:(\\d+)\\s*[${chunkClass}]\\s*)?(\\d+))?$`),
	};
}

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
 * @param settings Plugin settings — supplies the configurable chapter↔verse separator.
 */
export function parseReference(input: string, settings: PluginSettings): Reference {
	const segments: Reference = [];
	let runningBook: string | undefined;
	const { bookAndChapterRegEx, leadingSeparatorRegEx, chapterSwitchRegEx, verseChunkRegEx } =
		separatorRegexes(settings.chapterVerseSeparator || ":.");

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
				.replace(leadingSeparatorRegEx, "");
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
