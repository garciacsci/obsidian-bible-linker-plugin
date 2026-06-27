/*
 * The shared, Obsidian-free rules for the human-readable label on each reference segment — the
 * clickable text in the Copy-text quote title and (per #20) the Link command's "Title style" links.
 *
 * Keeping these rules in one place means the two commands can't drift: a segment restates the full
 * book name on the first segment and on every book change, restates the chapter on a same-book
 * chapter switch, and shows its verse span alone for a same-chapter chunk. Notation (":" by default)
 * comes from settings so the label honors the user's chapter↔verse separator.
 */
import type { PluginSettings } from "../main";
import expandBibleBookName from "../utils/expandedBookName";

/**
 * The per-segment input the label rules need: the segment's book + start chapter, the chapter the
 * segment ends in (for a cross-chapter range; defaults to the start chapter), and the resolved
 * human verse span (e.g. "17", "1-3", "27-2:2"). Obsidian-free by construction.
 */
export type LabelInput = {
	book: string;
	chapter: number;
	endChapter?: number;
	span: string;
};

/**
 * Computes the title label for each segment, in order. `isSingleVerse` is whether the *whole*
 * reference is a single verse (only then does the first segment use the one-verse notation),
 * mirroring buildQuote's original `items.length === 1 && reference.length === 1` test.
 *
 * Pure: pass only the segments you intend to label (e.g. buildQuote omits unresolved ones in
 * partial mode); the book/chapter change rules track across consecutive entries.
 */
export function buildSegmentLabels(
	segments: LabelInput[],
	isSingleVerse: boolean,
	settings: PluginSettings
): string[] {
	const labels: string[] = [];
	let prevBook: string | undefined;
	let prevChapter: number | undefined;

	for (let s = 0; s < segments.length; s++) {
		const { book, chapter, endChapter, span } = segments[s];
		const fullName = expandBibleBookName(`${book} ${chapter}`);
		const bookChanged = s > 0 && book.toLowerCase() !== prevBook;
		const chapterChanged = s > 0 && !bookChanged && chapter !== prevChapter;

		let label: string;
		if (s === 0) {
			const notation = isSingleVerse
				? settings.oneVerseNotation
				: settings.multipleVersesNotation;
			label = `${fullName}${notation}${span}`;
		} else if (bookChanged) {
			label = `${fullName}${settings.multipleVersesNotation}${span}`;
		} else if (chapterChanged) {
			label = `${chapter}${settings.multipleVersesNotation}${span}`;
		} else {
			label = span;
		}
		labels.push(label);

		prevBook = book.toLowerCase();
		prevChapter = endChapter ?? chapter;
	}

	return labels;
}

/** A segment plus where its title link points (the resolved chapter file name + verse anchor). */
export type TitleSegment = LabelInput & { fileName: string; anchor: string };

/**
 * Renders the Copy-text quote title: each segment as a wikilink to its first verse, labeled by the
 * shared rules and joined with ", " (comma + space, per #16). Used only by buildQuote; the Link
 * command reuses buildSegmentLabels directly because it targets links differently.
 */
export function buildQuoteTitleLinks(
	segments: TitleSegment[],
	isSingleVerse: boolean,
	settings: PluginSettings
): string {
	const labels = buildSegmentLabels(segments, isSingleVerse, settings);
	return segments
		.map((seg, i) => `[[${seg.fileName}#${seg.anchor}|${labels[i]}]]`)
		.join(", ");
}
