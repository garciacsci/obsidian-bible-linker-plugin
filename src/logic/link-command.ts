import {App, Notice} from "obsidian";
import {LinkType} from "../logic/link-type";
import {PluginSettings} from "../main";
import {multipleChaptersRegEx} from "../utils/regexes";
import {capitalize, getFileByFilename, parseUserBookInput,} from "./common";
import {parseReference} from "./reference";
import {buildLinks} from "./link";
import {ObsidianVerseSource} from "./obsidian-verse-source";

/**
 * Converts biblical reference to links to given verses or books
 * @param app App instance
 * @param userInput User Input (link to verse or chapter)
 * @param linkType Type of link that should be used
 * @param useNewLine Whether or not should each link be on new line
 * @param settings Plugin's settings
 * @returns String with quote of linked verses. If converting was not successful, returns empty string.
 */
export async function createLinks(
	app: App,
	userInput: string,
	linkType: LinkType,
	useNewLine: boolean,
	settings: PluginSettings
) {
	if (multipleChaptersRegEx.test(userInput)) {
		return getLinksForChapters(
			app,
			userInput,
			linkType,
			useNewLine,
			settings
		);
	} else {
		return getLinksForVerses(
			app,
			userInput,
			linkType,
			useNewLine,
			settings
		);
	}
}

/**
 * Thin Obsidian-facing wrapper: parses the reference, verifies the file (when asked), delegates
 * link assembly to the pure buildLinks across every segment, and lays the links out per the
 * useNewLine toggle. All grammar (multi-chunk, cross-chapter, cross-book) lives in buildLinks.
 */
async function getLinksForVerses(
	app: App,
	userInput: string,
	linkType: LinkType,
	useNewLine: boolean,
	settings: PluginSettings
) {
	let reference;
	try {
		reference = parseReference(userInput, settings);
	} catch (err) {
		new Notice(`Wrong format "${userInput}"`);
		throw err;
	}

	if (settings.verifyFilesWhenLinking) {
		const { book, chapter } = reference[0];
		let bookAndChapter = `${book} ${chapter}`;
		if (settings.shouldCapitalizeBookNames) {
			bookAndChapter = capitalize(bookAndChapter); // For output consistency
		}
		const { fileName, tFile } = getFileByFilename(app, bookAndChapter, "/", settings);
		if (!tFile) {
			new Notice(
				`File "${fileName}" does not exist and verify files is set to true`
			);
			throw `File ${fileName} does not exist, verify files = true`;
		}
	}

	// The Link command targets the vault's "Book Chapter" files directly (no translation folder),
	// so the source resolves files the same way the legacy command did: path "/".
	const verseSource = new ObsidianVerseSource(app, settings);
	let links: string[];
	try {
		links = await buildLinks(reference, linkType, settings, verseSource, "/");
	} catch (err) {
		new Notice(typeof err === "string" ? err : `${err}`);
		throw err;
	}

	return useNewLine ? links.map((link) => `${link}\n`).join("") : links.join("");
}


/**
 * Creates copy command output when linking multiple chapters
 */
async function getLinksForChapters(
	app: App,
	userInput: string,
	linkType: LinkType,
	useNewLine: boolean,
	settings: PluginSettings
) {
	const { book, firstChapter, lastChapter } = parseUserBookInput(userInput);
	if (firstChapter > lastChapter) {
		new Notice("Begin chapter is bigger than end chapter");
		throw "Begin chapter is bigger than end chapter";
	}

	let res = "";
	for (let i = firstChapter; i <= lastChapter; i++) {
		res += `[[${book} ${i}]]`;
		if (useNewLine) {
			res += "\n";
		}
	}
	return res;
}
