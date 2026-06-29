/*
 * The Obsidian-backed VerseSource adapter: the one place that touches vault.read and the
 * metadataCache heading index. It resolves a chapter file the same way the commands do and
 * hands the raw lines + headings to the pure extractor, isolating today's fragile
 * heading-level / offset / line-scanning heuristics behind the port.
 */
import { App } from "obsidian";
import type { PluginSettings } from "../main";
import { capitalize, getFileByFilename } from "./common";
import {
	Chapter,
	extractChapterVerses,
	extractSectionStarts,
	ExtractOptions,
	HeadingInfo,
	VerseSource,
} from "./verse-source";

export class ObsidianVerseSource implements VerseSource {
	constructor(private app: App, private settings: PluginSettings) {}

	async getChapter(book: string, chapter: number, translation: string): Promise<Chapter> {
		const filename = capitalize(`${book} ${chapter}`);
		const { fileName, tFile } = getFileByFilename(this.app, filename, translation, this.settings);
		if (!tFile) {
			throw new Error(`Chapter file not found: ${filename}`);
		}

		const lines = (await this.app.vault.read(tFile)).split(/\r?\n/);
		const headings: HeadingInfo[] = (
			this.app.metadataCache.getFileCache(tFile).headings ?? []
		).map((heading) => ({
			heading: heading.heading,
			level: heading.level,
			line: heading.position.start.line,
		}));

		const options: ExtractOptions = {
			verseHeadingLevel: this.settings.verseHeadingLevel,
			verseOffset: this.settings.verseOffset,
			sectionHeadingLevel: this.settings.sectionHeadingLevel,
		};
		const verses = extractChapterVerses(lines, headings, options);
		const sectionStarts = extractSectionStarts(headings, options);
		return { fileName, verses, sectionStarts };
	}
}
