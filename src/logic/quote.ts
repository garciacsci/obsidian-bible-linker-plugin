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
import type { Chapter, VerseSource } from "./verse-source";
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

	const titleLinks: string[] = [];
	const bodyParts: string[] = [];
	const invisibleLinks: string[] = [];

	for (let s = 0; s < reference.length; s++) {
		const { book, chapter, range } = reference[s];
		const { fileName, verses } = await resolve(book, chapter);

		const startVerse = range.startVerse;
		// An end verse past the chapter clamps to its last verse, matching the legacy Copy command.
		const endVerse = Math.min(range.endVerse, verses.length);
		const single = startVerse === endVerse;
		const span = single ? `${startVerse}` : `${startVerse}-${endVerse}`;

		// The first chunk carries the full book + chapter + notation; later chunks show their
		// span alone, each link pointing at its own chunk's first verse.
		if (s === 0) {
			const notation =
				single && reference.length === 1
					? settings.oneVerseNotation
					: settings.multipleVersesNotation;
			const label = `${expandBibleBookName(`${book} ${chapter}`)}${notation}${span}`;
			titleLinks.push(`[[${fileName}#${verses[startVerse - 1].anchor}|${label}]]`);
		} else {
			titleLinks.push(`[[${fileName}#${verses[startVerse - 1].anchor}|${span}]]`);
		}

		let part = "";
		for (let v = startVerse; v <= endVerse; v++) {
			if (v > startVerse) part += " ";
			part += numbersToSuperscript(`${v}`) + verses[v - 1].text.replace(/\n/g, " ");
		}
		bodyParts.push(part);

		// Every cited verse not already covered by its chunk-start link gets an invisible link.
		for (let v = startVerse + 1; v <= endVerse; v++) {
			invisibleLinks.push(`[[${fileName}#${verses[v - 1].anchor}|]]`);
		}
	}

	// A spaced ellipsis marks each gap between non-contiguous chunks (honest omission).
	const lines = [`> [!quote] ${titleLinks.join(",")}`, `> ${bodyParts.join(" … ")}`];
	if (settings.useInvisibleLinks && invisibleLinks.length) {
		lines.push(`> ${invisibleLinks.join("")}`);
	}

	return lines.join("\n");
}
