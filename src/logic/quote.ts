/*
 * Pure builder (Seam 3) that turns a parsed reference into a single inlined quote — a
 * [!quote] callout holding the verse text as flowing prose with superscript verse numbers,
 * plus invisible links so every cited verse still shows up in its file's backlinks.
 *
 * Obsidian-free: everything Obsidian-derived (verse text, anchors, the resolved chapter
 * file name) arrives through the VerseSource port, so the builder is unit-tested with a
 * fake source. Per ADR-0001 the output is a static snapshot, not a live transclusion.
 */
import type { PluginSettings } from "../main";
import type { Reference } from "./reference";
import type { Chapter, Verse, VerseSource } from "./verse-source";
import expandBibleBookName from "../utils/expandedBookName";
import { numbersToSuperscript } from "../utils/functions";
import { buildQuoteTitleLinks, type TitleSegment } from "./segment-label";

/**
 * Builds the quote markdown for a reference. Pure given the port: throws (never shows a
 * Notice) so the command owns user-facing failure, mirroring parseReference.
 */
export async function buildQuote(
	reference: Reference,
	verseSource: VerseSource,
	settings: PluginSettings,
	translation: string
): Promise<string> {
	// Resolve each cited chapter once; abort the whole insertion if any is missing — a partial
	// quote would mislead. (Within one chapter, #10 cites several chunks of the same file.)
	// The body verse marker honors the configured style: superscript (default) or plain arabic.
	const verseMarker = (n: number): string =>
		settings.verseNumberStyle === "plain" ? `${n}` : numbersToSuperscript(`${n}`);

	const chapters = new Map<string, Chapter>();
	const resolve = async (book: string, chapter: number): Promise<Chapter> => {
		const key = `${book} ${chapter}`;
		const cached = chapters.get(key);
		if (cached) return cached;
		try {
			const resolved = await verseSource.getChapter(book, chapter, translation);
			chapters.set(key, resolved);
			return resolved;
		} catch {
			throw new Error(`Could not find ${expandBibleBookName(key)}`);
		}
	};

	// One verse as it appears in the quote: which file it links to, the body marker that
	// precedes its text (a superscript number, or a bold C:V at a chapter jump), and its text.
	type Cited = { fileName: string; anchor: string; marker: string; text: string };

	// Flattens a segment into the verses it cites, in reading order. A segment may cross a
	// chapter boundary within its book (range.endChapter): it runs from the start verse to the
	// start chapter's last verse (count from the VerseSource, never a hardcoded table), then
	// from verse 1 of the next chapter to the end verse, marking the jump with a bold C:V.
	const cite = (fileName: string, verse: Verse, marker: string): Cited => ({
		fileName,
		anchor: verse.anchor,
		marker,
		text: verse.text.replace(/\n/g, " "),
	});
	const citedVersesOf = async (
		segment: Reference[number]
	): Promise<{ items: Cited[]; span: string }> => {
		const { book, chapter, range } = segment;
		const start = await resolve(book, chapter);
		const startVerse = range.startVerse;
		const items: Cited[] = [];

		if (range.endChapter !== undefined && range.endChapter !== chapter) {
			for (let v = startVerse; v <= start.verses.length; v++) {
				items.push(cite(start.fileName, start.verses[v - 1], verseMarker(v)));
			}
			const end = await resolve(book, range.endChapter);
			const endVerse = Math.min(range.endVerse, end.verses.length);
			for (let v = 1; v <= endVerse; v++) {
				const marker =
					v === 1 && settings.showChapterJumpMarker
						? `**${range.endChapter}:${v}**`
						: verseMarker(v);
				items.push(cite(end.fileName, end.verses[v - 1], marker));
			}
			return { items, span: `${startVerse}-${range.endChapter}:${endVerse}` };
		}

		// An open-ended "ff" range runs to the chapter's last verse; otherwise an end verse past the
		// chapter clamps to its last verse, matching the legacy Copy command.
		const endVerse = range.toChapterEnd
			? start.verses.length
			: Math.min(range.endVerse, start.verses.length);
		for (let v = startVerse; v <= endVerse; v++) {
			items.push(cite(start.fileName, start.verses[v - 1], verseMarker(v)));
		}
		const span = startVerse === endVerse ? `${startVerse}` : `${startVerse}-${endVerse}`;
		return { items, span };
	};

	// Resolved segments feeding the title line; the label rules live in the shared helper. Only
	// resolved segments are collected, so partial mode (an unresolved segment skipped below) drops
	// out of the title exactly as before.
	const titleSegments: TitleSegment[] = [];
	const bodyLines: string[] = []; // each "> "-prefixed later; "" renders as a bare ">" blank line
	const invisibleLinks: string[] = [];
	let prevBook: string | undefined;
	let prevChapter: number | undefined;
	let singleVerseReference = false;

	for (let s = 0; s < reference.length; s++) {
		const { book, chapter, range } = reference[s];
		let items: Cited[];
		let span: string;
		try {
			({ items, span } = await citedVersesOf(reference[s]));
		} catch (err) {
			// Default: abort the whole quote (a partial would mislead). When partial mode is on,
			// keep the resolved segments and flag the unresolved one inline instead.
			if (!settings.insertPartialOnUnresolved) throw err;
			bodyLines.push(`**Could not find ${expandBibleBookName(`${book} ${chapter}`)}**`);
			continue;
		}
		const first = items[0];
		// A ";" segment may switch book or, within the same book, switch chapter.
		const bookChanged = s > 0 && book.toLowerCase() !== prevBook;
		const chapterChanged = s > 0 && !bookChanged && chapter !== prevChapter;
		const fullName = expandBibleBookName(`${book} ${chapter}`);

		// Collect this resolved segment for the title; the shared helper applies the label rules
		// (full book name on first/book-change, chapter on a same-book chapter switch, span alone
		// for a same-chapter chunk). Each link points at its own segment's first verse.
		if (s === 0) {
			singleVerseReference = items.length === 1 && reference.length === 1;
		}
		titleSegments.push({
			book,
			chapter,
			endChapter: range.endChapter,
			span,
			fileName: first.fileName,
			anchor: first.anchor,
		});

		// A same-book chapter switch marks its first verse with a bold C:V so the new chapter can't
		// be misread, mirroring the cross-chapter range jump; a book jump restates the book instead.
		if (chapterChanged && settings.showChapterJumpMarker) {
			items[0] = { ...first, marker: `**${chapter}:${range.startVerse}**` };
		}
		const bodyText = items.map((i) => i.marker + i.text).join(" ");
		if (s === 0) {
			bodyLines.push(bodyText);
		} else if (bookChanged) {
			// A book jump is separated from the prior book by a blank line, then restates the book.
			bodyLines.push("");
			bodyLines.push(`**${fullName}** ${bodyText}`);
		} else if (chapterChanged) {
			// A same-book chapter jump starts its own line (no leading ellipsis); its bold C:V
			// marker, already applied above, makes the new chapter unambiguous.
			bodyLines.push(bodyText);
		} else {
			// Same book and chapter: a spaced ellipsis marks the gap to the previous chunk (honest
			// omission); when the ellipsis is off, the chunks just run together with a plain space.
			const gap = settings.showOmissionEllipsis ? " … " : " ";
			bodyLines[bodyLines.length - 1] += `${gap}${bodyText}`;
		}

		// Every cited verse not already covered by its segment's link gets an invisible link.
		for (let i = 1; i < items.length; i++) {
			invisibleLinks.push(`[[${items[i].fileName}#${items[i].anchor}|]]`);
		}

		prevBook = book.toLowerCase();
		prevChapter = range.endChapter ?? chapter;
	}

	// The callout wrapper is configurable; an empty wrapper drops the callout token and falls
	// back to plain "> " quote lines (the firstLinePrefix machinery, ADR-0001).
	const titleLinks = buildQuoteTitleLinks(titleSegments, singleVerseReference, settings);
	const titleLine = settings.quoteCallout
		? `> ${settings.quoteCallout} ${titleLinks}`
		: `> ${titleLinks}`;
	// A blank body line (a book-jump separator) renders as a bare ">" so the callout stays
	// contiguous without trailing whitespace; content lines keep their "> " prefix.
	const lines = [titleLine, ...bodyLines.map((l) => (l === "" ? ">" : `> ${l}`))];
	if (settings.useInvisibleLinks && invisibleLinks.length) {
		lines.push(`> ${invisibleLinks.join("")}`);
	}

	return lines.join("\n");
}
