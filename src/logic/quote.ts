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
	const segment = reference[0];
	const { book, chapter, range } = segment;
	const { startVerse } = range;

	const fullName = expandBibleBookName(`${book} ${chapter}`);

	// Abort the whole insertion if any cited chapter is missing — a partial quote would mislead.
	let resolved: Chapter;
	try {
		resolved = await verseSource.getChapter(book, chapter, translation);
	} catch {
		throw new Error(`Could not find ${fullName}`);
	}
	const { fileName, verses } = resolved;

	// An end verse past the chapter is clamped to its last verse, matching the legacy Copy command.
	const endVerse = Math.min(range.endVerse, verses.length);
	const notation = startVerse === endVerse ? settings.oneVerseNotation : settings.multipleVersesNotation;
	const span = startVerse === endVerse ? `${startVerse}` : `${startVerse}-${endVerse}`;
	const title = `[[${fileName}#${verses[startVerse - 1].anchor}|${fullName}${notation}${span}]]`;

	let body = "";
	for (let v = startVerse; v <= endVerse; v++) {
		if (v > startVerse) body += " ";
		body += numbersToSuperscript(`${v}`) + verses[v - 1].text.replace(/\n/g, " ");
	}

	const lines = [`> [!quote] ${title}`, `> ${body}`];

	if (settings.useInvisibleLinks) {
		let invisible = "";
		for (let v = startVerse + 1; v <= endVerse; v++) {
			invisible += `[[${fileName}#${verses[v - 1].anchor}|]]`;
		}
		if (invisible) lines.push(`> ${invisible}`);
	}

	return lines.join("\n");
}
