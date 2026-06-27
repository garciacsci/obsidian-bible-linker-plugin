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

		// An end verse past the chapter clamps to its last verse, matching the legacy Copy command.
		const endVerse = Math.min(range.endVerse, start.verses.length);
		for (let v = startVerse; v <= endVerse; v++) {
			items.push(cite(start.fileName, start.verses[v - 1], verseMarker(v)));
		}
		const span = startVerse === endVerse ? `${startVerse}` : `${startVerse}-${endVerse}`;
		return { items, span };
	};

	const titleLinks: string[] = [];
	const bodyLines: string[] = []; // each "> "-prefixed later; a book jump starts a new line
	const invisibleLinks: string[] = [];
	let prevBook: string | undefined;
	let prevChapter: number | undefined;

	for (let s = 0; s < reference.length; s++) {
		const { book, chapter, range } = reference[s];
		const { items, span } = await citedVersesOf(reference[s]);
		const first = items[0];
		// A ";" segment may switch book or, within the same book, switch chapter.
		const bookChanged = s > 0 && book.toLowerCase() !== prevBook;
		const chapterChanged = s > 0 && !bookChanged && chapter !== prevChapter;
		const fullName = expandBibleBookName(`${book} ${chapter}`);

		// The title restates the full book name on the first segment and on every book change; a
		// same-book chapter switch restates the chapter; a same-chapter chunk shows its span alone.
		// Each link points at its own segment's first verse.
		let label: string;
		if (s === 0) {
			const single = items.length === 1 && reference.length === 1;
			const notation = single ? settings.oneVerseNotation : settings.multipleVersesNotation;
			label = `${fullName}${notation}${span}`;
		} else if (bookChanged) {
			label = `${fullName}${settings.multipleVersesNotation}${span}`;
		} else if (chapterChanged) {
			label = `${chapter}${settings.multipleVersesNotation}${span}`;
		} else {
			label = span;
		}
		titleLinks.push(`[[${first.fileName}#${first.anchor}|${label}]]`);

		// A same-book chapter switch marks its first verse with a bold C:V so the new chapter can't
		// be misread, mirroring the cross-chapter range jump; a book jump restates the book instead.
		if (chapterChanged && settings.showChapterJumpMarker) {
			items[0] = { ...first, marker: `**${chapter}:${range.startVerse}**` };
		}
		const bodyText = items.map((i) => i.marker + i.text).join(" ");
		if (s === 0) {
			bodyLines.push(bodyText);
		} else if (bookChanged) {
			bodyLines.push(`**${fullName}** ${bodyText}`);
		} else {
			// Same book: a spaced ellipsis marks the gap to the previous chunk (honest omission);
			// when the ellipsis is off, the chunks just run together with a plain space.
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
	const titleLine = settings.quoteCallout
		? `> ${settings.quoteCallout} ${titleLinks.join(",")}`
		: `> ${titleLinks.join(",")}`;
	const lines = [titleLine, ...bodyLines.map((l) => `> ${l}`)];
	if (settings.useInvisibleLinks && invisibleLinks.length) {
		lines.push(`> ${invisibleLinks.join("")}`);
	}

	return lines.join("\n");
}
