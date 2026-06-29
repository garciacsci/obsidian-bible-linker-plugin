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
import { buildSegmentLabels, type LabelInput } from "./segment-label";

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
	if (linkType === LinkType.TitleStyle) {
		return buildTitleStyleLinks(reference, settings, verseSource, translation);
	}

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
			// An open-ended "ff" range runs to the chapter's last verse (count from the VerseSource).
			const endVerse = range.toChapterEnd
				? (await verseSource.getChapter(book, chapter, translation)).verses.length
				: range.endVerse;
			if (range.startVerse > endVerse) {
				throw "Begin verse is bigger than end verse";
			}
			for (let v = range.startVerse; v <= endVerse; v++) {
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

/**
 * The "Title style" path: one visible labeled link per chunk (labels from the shared segment-label
 * helper, identical to the Copy-text title), each followed by invisible links to the chunk's other
 * cited verses so every verse still lands in backlinks. Returns one string per chunk; the command's
 * layout joins them with ", " (or one per line when "Each link on new line" is on).
 */
async function buildTitleStyleLinks(
	reference: Reference,
	settings: PluginSettings,
	verseSource: VerseSource,
	translation: string
): Promise<string[]> {
	// Resolve each chunk to its cited verses (with per-verse stems) and its human span. A
	// single-chapter chunk needs no verse counts — it never touches the VerseSource — matching the
	// rest of the Link command; only a cross-chapter range reads counts to enumerate the boundary.
	const chunks: { cited: Cited[]; label: LabelInput }[] = [];
	let totalVerses = 0;

	for (const { book, chapter, range } of reference) {
		const startStem = stemFor(book, chapter, settings);
		const cited: Cited[] = [];
		let span: string;

		if (range.endChapter !== undefined && range.endChapter !== chapter) {
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
			span = `${range.startVerse}-${range.endChapter}:${endVerse}`;
		} else {
			// An open-ended "ff" range runs to the chapter's last verse (count from the VerseSource).
			const endVerse = range.toChapterEnd
				? (await verseSource.getChapter(book, chapter, translation)).verses.length
				: range.endVerse;
			if (range.startVerse > endVerse) {
				throw "Begin verse is bigger than end verse";
			}
			for (let v = range.startVerse; v <= endVerse; v++) {
				cited.push({ bookAndChapter: startStem, verse: v });
			}
			span =
				range.startVerse === endVerse
					? `${range.startVerse}`
					: `${range.startVerse}-${endVerse}`;
		}

		totalVerses += cited.length;
		chunks.push({ cited, label: { book, chapter, endChapter: range.endChapter, span } });
	}

	const isSingleVerse = reference.length === 1 && totalVerses === 1;
	const labels = buildSegmentLabels(
		chunks.map((c) => c.label),
		isSingleVerse,
		settings
	);

	return chunks.map(({ cited }, i) => {
		const [first, ...rest] = cited;
		const visible = `[[${target(first, settings)}|${labels[i]}]]`;
		const invisible = rest.map((c) => `[[${target(c, settings)}|]]`).join("");
		return visible + invisible;
	});
}

/** A cited verse's link target: the "Book Chapter" stem + separator + verse prefix + verse number. */
function target(cited: Cited, settings: PluginSettings): string {
	return `${cited.bookAndChapter}${settings.linkSeparator}${settings.versePrefix}${cited.verse}`;
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
	return `${beginning}[[${target(cited, settings)}${ending}]]`;
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
