/*
 * Pure builder for the Link command: turns a parsed reference into Obsidian wikilinks, one per
 * cited verse, in the chosen link style. The Obsidian-facing wrapper (link-command.ts) owns
 * Notices, file verification, and the newline layout; everything format-derived (verse counts
 * for a cross-chapter range) arrives through the VerseSource port, so the builder is unit-tested
 * with a fake source and no Obsidian.
 *
 * Unlike buildQuote, the Link command targets the "Book Chapter" name as the user typed it (not
 * the VerseSource's resolved fileName) — that is the legacy link target, preserved byte-for-byte.
 */
import type { PluginSettings } from "../main";
import type { Reference } from "./reference";
import type { VerseSource } from "./verse-source";
import { LinkType } from "./link-type";
import { capitalize } from "../utils/functions";
import expandBibleBookName from "../utils/expandedBookName";

/** One cited verse as a link target: the "Book Chapter" stem plus the verse number. */
type Cited = { bookAndChapter: string; verse: number };

/**
 * Builds the Link command's wikilinks for a reference: one link string per cited verse, in
 * reading order across every segment. Pure given the port — throws (never shows a Notice) so the
 * command owns user-facing failure, mirroring parseReference / buildQuote.
 */
export async function buildLinks(
	reference: Reference,
	linkType: LinkType,
	settings: PluginSettings,
	verseSource: VerseSource,
	translation: string
): Promise<string[]> {
	const links: string[] = [];

	for (const { book, chapter, range } of reference) {
		const startStem = stemFor(book, chapter, settings);
		const cited: Cited[] = [];

		if (range.endChapter !== undefined && range.endChapter !== chapter) {
			// A range that crosses a chapter boundary within the book: run from the start verse to
			// the start chapter's last verse (count from the VerseSource, never a hardcoded table),
			// then from verse 1 of the next chapter to the end verse, clamping any overrun.
			const start = await verseSource.getChapter(book, chapter, translation);
			for (let v = range.startVerse; v <= start.verses.length; v++) {
				cited.push({ bookAndChapter: startStem, verse: v });
			}
			const endStem = stemFor(book, range.endChapter, settings);
			const end = await verseSource.getChapter(book, range.endChapter, translation);
			const endVerse = Math.min(range.endVerse, end.verses.length);
			for (let v = 1; v <= endVerse; v++) {
				cited.push({ bookAndChapter: endStem, verse: v });
			}
		} else {
			if (range.startVerse > range.endVerse) {
				throw "Begin verse is bigger than end verse";
			}
			for (let v = range.startVerse; v <= range.endVerse; v++) {
				cited.push({ bookAndChapter: startStem, verse: v });
			}
		}

		// FirstAndLast is scoped per segment: the segment's first/last cited verse carry the
		// labels, its middles are invisible. Other modes treat every verse uniformly.
		for (let i = 0; i < cited.length; i++) {
			links.push(renderLink(cited[i], i, cited.length, linkType, settings));
		}
	}

	return links;
}

/** The "Book Chapter" link stem, capitalized for output consistency when the setting is on. */
function stemFor(book: string, chapter: number, settings: PluginSettings): string {
	const stem = `${book} ${chapter}`;
	return settings.shouldCapitalizeBookNames ? capitalize(stem) : stem;
}

function renderLink(
	cited: Cited,
	index: number,
	count: number,
	linkType: LinkType,
	settings: PluginSettings
): string {
	const beginning = linkType === LinkType.Embedded ? "!" : "";
	const ending = getLinkEnding(cited, index, count, linkType, settings);
	return `${beginning}[[${cited.bookAndChapter}${settings.linkSeparator}${settings.versePrefix}${cited.verse}${ending}]]`;
}

function getLinkEnding(
	cited: Cited,
	index: number,
	count: number,
	linkType: LinkType,
	settings: PluginSettings
): string {
	switch (linkType) {
		case LinkType.Invisible:
			return "|";
		case LinkType.FirstAndLast: {
			const displayBook = expandBibleBookName(cited.bookAndChapter); // fully-qualified in alt text
			if (count === 1) {
				return `|${displayBook}${settings.oneVerseNotation}${cited.verse}`;
			}
			if (index === 0) {
				return `|${displayBook}${settings.multipleVersesNotation}${cited.verse}`;
			}
			if (index === count - 1) {
				return `|-${cited.verse}`;
			}
			return "|"; // links between first and last verse are invisible
		}
		default:
			return "";
	}
}
