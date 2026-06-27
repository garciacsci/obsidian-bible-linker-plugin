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
				items.push(cite(start.fileName, start.verses[v - 1], numbersToSuperscript(`${v}`)));
			}
			const end = await resolve(book, range.endChapter);
			const endVerse = Math.min(range.endVerse, end.verses.length);
			for (let v = 1; v <= endVerse; v++) {
				const marker = v === 1 ? `**${range.endChapter}:${v}**` : numbersToSuperscript(`${v}`);
				items.push(cite(end.fileName, end.verses[v - 1], marker));
			}
			return { items, span: `${startVerse}-${range.endChapter}:${endVerse}` };
		}

		// An end verse past the chapter clamps to its last verse, matching the legacy Copy command.
		const endVerse = Math.min(range.endVerse, start.verses.length);
		for (let v = startVerse; v <= endVerse; v++) {
			items.push(cite(start.fileName, start.verses[v - 1], numbersToSuperscript(`${v}`)));
		}
		const span = startVerse === endVerse ? `${startVerse}` : `${startVerse}-${endVerse}`;
		return { items, span };
	};

	const titleLinks: string[] = [];
	const bodyParts: string[] = [];
	const invisibleLinks: string[] = [];

	for (let s = 0; s < reference.length; s++) {
		const { book, chapter } = reference[s];
		const { items, span } = await citedVersesOf(reference[s]);
		const first = items[0];

		// The first chunk carries the full book + chapter + notation; later chunks show their
		// span alone, each link pointing at its own chunk's first verse.
		if (s === 0) {
			const single = items.length === 1 && reference.length === 1;
			const notation = single ? settings.oneVerseNotation : settings.multipleVersesNotation;
			const label = `${expandBibleBookName(`${book} ${chapter}`)}${notation}${span}`;
			titleLinks.push(`[[${first.fileName}#${first.anchor}|${label}]]`);
		} else {
			titleLinks.push(`[[${first.fileName}#${first.anchor}|${span}]]`);
		}

		bodyParts.push(items.map((i) => i.marker + i.text).join(" "));

		// Every cited verse not already covered by its chunk-start link gets an invisible link.
		for (let i = 1; i < items.length; i++) {
			invisibleLinks.push(`[[${items[i].fileName}#${items[i].anchor}|]]`);
		}
	}

	// A spaced ellipsis marks each gap between non-contiguous chunks (honest omission).
	const lines = [`> [!quote] ${titleLinks.join(",")}`, `> ${bodyParts.join(" … ")}`];
	if (settings.useInvisibleLinks && invisibleLinks.length) {
		lines.push(`> ${invisibleLinks.join("")}`);
	}

	return lines.join("\n");
}
