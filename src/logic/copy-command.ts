import { App, Notice, TFile } from "obsidian";
import { PluginSettings } from "../main";
import {bookAndChapterRegEx, escapeForRegex, isOBSKFileRegEx} from "../utils/regexes";
import { capitalize, getFileByFilename as getTFileByFilename } from "./common";
import { parseReference } from "./reference";
import { ObsidianVerseSource } from "./obsidian-verse-source";
import { Verse } from "./verse-source";
import {numbersToSuperscript} from "../utils/functions";

/**
 * Converts biblical reference to text of given verses
 * @param app App instance
 * @param userInput User Input (link to verse)
 * @param settings Plugin settings
 * @param translationPath Path to translation that should be used
 * @param linkOnly Whether to insert output only link or also include text
 * @param verbose Whether or not user should be notified if the link is incorrect
 * @returns String with quote of linked verses. If converting was not successful, returns empty string.
 * @verbose Determines if Notices will be shown or not
 */
export async function getTextOfVerses(app: App, userInput: string, settings: PluginSettings, translationPath: string, linkOnly: boolean, verbose = true): Promise<string> {

    let book: string, chapter: number, beginVerse: number, endVerse: number;
    try {
        const [segment] = parseReference(userInput, settings);
        book = segment.book;
        chapter = segment.chapter;
        beginVerse = segment.range.startVerse;
        endVerse = segment.range.endVerse;
    } catch (err) {
        if (verbose) {
            new Notice(`Wrong format "${userInput}"`);
        }
        throw err;
    }
    const bookAndChapter = capitalize(`${book} ${chapter}`) // For output consistency
    const { fileName, tFile } = getTFileByFilename(app, bookAndChapter, translationPath, settings);
    if (tFile) {
        const verses = await new ObsidianVerseSource(app, settings).getChapterVerses(book, chapter, translationPath);
        return createCopyOutput(app, tFile, fileName, verses, beginVerse, endVerse, settings, translationPath, linkOnly, verbose);
    } else {
        if (verbose) {
            new Notice(`File ${bookAndChapter} not found`);
        }
        throw "File not found"
    }
}

/**
 * Renders a verse's canonical text (content lines joined by "\n") into the configured layout:
 * either "\n" + prefix per line (newLines), or a single space between lines.
 */
function renderVerseText(text: string, keepNewlines: boolean, newLinePrefix: string) {
    return keepNewlines ? text.replace(/\n/g, `\n${newLinePrefix}`) : text.replace(/\n/g, " ");
}

/**
 * Replaces "\n" with newline character in given string (when user inputs "\n" in the settings it is automatically converted to "\\n" and does not work as newline)
 */
function replacePlaceholdersInPostfix(input: string, translationPath: string) {
	let result = input.replace(/\\n/g, "\n",);
	if (translationPath != "" && translationPath != undefined) {
		result = result.replace(/{t}/g, getTranslationNameFromPath(translationPath));
	}
	return result;
}

/**
 * Returns the name of the translation from the path to it.
 * For example for path "personal/bible/NIV/" it will return "NIV"
 * @param path
 */
export function getTranslationNameFromPath(path: string) {
	const splitPath = path.split("/");
	return splitPath[splitPath.length - 2];
}

/**
 * Replaces the given book with its display value defined in the settings. If no mapping exists, the original value is returned.
 * @param book Book that should be replaced
 * @param settings Plugin's settings
 */
function getDisplayBookName(book: string, settings: PluginSettings) {
	return settings.outputBookMap[book.toLowerCase()] ?? book;
}

/**
 * Takes orginal filename and converts it to human-readable version if Bible study kit is used (removes "-" and leading zeros)
 */
function createBookAndChapterOutput(fileBasename: string, settings: PluginSettings) {
	const isOBSK = isOBSKFileRegEx.test(fileBasename);
	const regex = isOBSK ? isOBSKFileRegEx : bookAndChapterRegEx;

	// eslint-disable-next-line prefer-const
	let [, book, chapter] = fileBasename.match(regex);
	if (isOBSK && chapter.toString()[0] === "0") { // remove leading zeros in OBSK chapters (eg. Gen-01)
		chapter = chapter.substring(1);
	}
	return getDisplayBookName(book, settings) + " " + chapter;
}

/**
 * Returns path to folder in which given file is located for main translation
 */
function getFileFolderInTranslation(app: App, filename: string, translation: string, settings: PluginSettings) {
    const tFileInfo = getTFileByFilename(app, filename, translation, settings);
    return tFileInfo.tFile.parent.path;
}

/**
 * Replaces special characters with the current verse information (useful for verse prefix, postfix etc.)
 * ```
 * {n} -> verse number
 * {u} -> verse number (unicode superscript)
 * {f} -> file name
 * {t} -> name of translation (if multiple translations are used)
 * ```
 */
function formatVerseInformation(stringToFormat: string, settings: PluginSettings, verseNumber: number, fileName: string, translationPath: string) {
	let output = "";
	output += stringToFormat.replace(/{n}/g, `${verseNumber}`);
	output = output.replace(/{u}/g, numbersToSuperscript(`${verseNumber}`));
	output = output.replace(/{f}/g, `${fileName}`);
	if (settings.enableMultipleTranslations) {
		output = output.replace(/{t}/g, `${getTranslationNameFromPath(translationPath)}`);
	}
	return output;
}

async function createCopyOutput(app: App, tFile: TFile, fileName: string, verses: Verse[], beginVerse: number, endVerse: number, settings: PluginSettings, translationPath: string, linkOnly: boolean, verbose: boolean) {
	const bookAndChapterOutput = createBookAndChapterOutput(tFile.basename, settings);
	const nrOfVerses = verses.length;
	const maxVerse = endVerse < nrOfVerses ? endVerse : nrOfVerses; // if endverse is bigger than chapter allows, it is lowered to maximum

	if (beginVerse > maxVerse) {
		if (verbose) {
			new Notice("Begin verse is bigger than end verse or chapter maximum")
		}
		throw "Begin verse is bigger than end verse or chapter maximum"
	}


	// 1 - Link to verses
	let postfix = "", res = "", pathToUse = "";
	if (!linkOnly) {
		res = settings.prefix;
		postfix = settings.postfix ? replacePlaceholdersInPostfix(settings.postfix, translationPath) : " ";
	}
	if (settings.enableMultipleTranslations) {
		if (settings.translationLinkingType !== "main") // link the translation that is currently being used
			pathToUse = getFileFolderInTranslation(app, fileName, translationPath, settings);
		else { // link main translation
			pathToUse = getFileFolderInTranslation(app, fileName, settings.parsedTranslationPaths.first(), settings);
		}
	}

	if (settings.newLines && !linkOnly) {
		res += `${settings.firstLinePrefix}`
	}

	if (beginVerse === maxVerse) {
		res += `[[${pathToUse ? pathToUse + "/" : ""}${fileName}#${verses[beginVerse - 1].anchor}|${bookAndChapterOutput}${settings.oneVerseNotation}${beginVerse}]]${postfix}` // [[Gen 1#1|Gen 1,1.1]]
	} else if (settings.linkEndVerse) {
		res += `[[${pathToUse ? pathToUse + "/" : ""}${fileName}#${verses[beginVerse - 1].anchor}|${bookAndChapterOutput}${settings.multipleVersesNotation}${beginVerse}-]]` // [[Gen 1#1|Gen 1,1-]]
		res += `[[${pathToUse ? pathToUse + "/" : ""}${fileName}#${verses[maxVerse - 1].anchor}|${maxVerse}]]${postfix}`; // [[Gen 1#3|3]]
	} else {
		res += `[[${pathToUse ? pathToUse + "/" : ""}${fileName}#${verses[beginVerse - 1].anchor}|${bookAndChapterOutput}${settings.multipleVersesNotation}${beginVerse}-${maxVerse}]]${postfix}` // [[Gen 1#1|Gen 1,1-3]]
	}

	// 2 - Text of verses
	if (!linkOnly) {
		for (let i = beginVerse; i <= maxVerse; i++) {
			let versePrefix = "";
			let versePostfix = "";
			const verseSpace = settings.insertSpace ? " " : "";
			if (settings.eachVersePrefix) {
				versePrefix = formatVerseInformation(settings.eachVersePrefix, settings, i, fileName, translationPath);
			}
			let verseText = renderVerseText(verses[i - 1].text, settings.newLines, settings.prefix);
			if (settings.eachVersePostfix) {
				versePostfix = formatVerseInformation(settings.eachVersePostfix, settings, i, fileName, translationPath);
			}

			if (settings.commentStart !== "" && settings.commentEnd !== "") {
				const escapedStart = escapeForRegex(settings.commentStart);
				const escapedEnd = escapeForRegex(settings.commentEnd);
				const replaceRegex = new RegExp(`${escapedStart}.*?${escapedEnd}`, 'gs');
				verseText = verseText.replace(replaceRegex, '');
			}
			if (settings.newLines) {
				res += "\n" + settings.prefix + versePrefix + verseText + versePostfix;
			} else {
				res += versePrefix + verseText + versePostfix + verseSpace;
			}
		}
	}

	// 3 - Invisible links
	if (!settings.useInvisibleLinks) return res;
	if ((beginVerse == maxVerse || (settings.linkEndVerse && beginVerse == maxVerse - 1)) // No need to add another link, when only one verse is being linked
		&& (!settings.enableMultipleTranslations
			|| settings.translationLinkingType === "main"
			|| settings.translationLinkingType === "used"
			|| (settings.translationLinkingType === "usedAndMain" && translationPath === settings.parsedTranslationPaths.first())))
		return res;

	if (settings.newLines) {
		res += `\n${settings.prefix}`;
	}
    const lastVerseToLink = settings.linkEndVerse ? maxVerse - 1 : maxVerse;
    for (let i = beginVerse; i <= lastVerseToLink; i++) { // beginVerse + 1 because link to first verse is already inserted before the text
        if (!settings.enableMultipleTranslations) {
			if (i == beginVerse) continue; // already linked in the first link before text
            res += `[[${fileName}#${verses[i - 1].anchor}|]]`
        }
        else { // multiple translations 
            let translationPathsToUse: string[] = [];
            switch (settings.translationLinkingType) {
                case "all":
                    translationPathsToUse = settings.parsedTranslationPaths.map((tr) => getFileFolderInTranslation(app, fileName, tr, settings))
                    break;
                case "used":
					if (i == beginVerse) continue; // already linked in the first link before text
                    translationPathsToUse = [getFileFolderInTranslation(app, fileName, translationPath, settings)]
                    break;
                case "usedAndMain":
                    if (translationPath !== settings.parsedTranslationPaths.first()) {
                        translationPathsToUse = [getFileFolderInTranslation(app, fileName, translationPath, settings),
                        getFileFolderInTranslation(app, fileName, settings.parsedTranslationPaths.first(), settings)];
                    }
                    else {
						if (i == beginVerse) continue; // already linked in the first link before text
                        translationPathsToUse = [getFileFolderInTranslation(app, fileName, translationPath, settings)];
                    }
                    break;
                case "main":
					if (i == beginVerse) continue; // already linked in the first link before text
                    translationPathsToUse = [getFileFolderInTranslation(app, fileName, settings.parsedTranslationPaths.first(), settings)];
                    break;
                default:
                    break;
            }
			if (translationPathsToUse.length === 0) return;

            translationPathsToUse.forEach((translationPath) => {
                res += `[[${translationPath}/${fileName}#${verses[i - 1].anchor}|]]`
            })
        }

    }
    return res;
}
