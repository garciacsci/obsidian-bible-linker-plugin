import { __awaiter } from "tslib";
import { Notice } from "obsidian";
import { escapeForRegex, isOBSKFile } from "../utils/regexes";
import { capitalize, getFileByFilename as getTFileByFilename, parseUserVerseInput } from "./common";
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
export function getTextOfVerses(app, userInput, settings, translationPath, linkOnly, verbose = true) {
    return __awaiter(this, void 0, void 0, function* () {
        // eslint-disable-next-line prefer-const
        let { bookAndChapter, beginVerse, endVerse } = parseUserVerseInput(userInput, verbose);
        bookAndChapter = capitalize(bookAndChapter); // For output consistency
        const { fileName, tFile } = getTFileByFilename(app, bookAndChapter, translationPath);
        if (tFile) {
            return yield createCopyOutput(app, tFile, fileName, beginVerse, endVerse, settings, translationPath, linkOnly, verbose);
        }
        else {
            if (verbose) {
                new Notice(`File ${bookAndChapter} not found`);
            }
            throw "File not found";
        }
    });
}
/**
 * Returns text of given verse using given headings and lines.
 * @param verseNumber Number of desired verse.
 * @param headings List of headings that should be searched. Second heading must correspond to first verse, third heading to second verse and so on.
 * @param lines Lines of file from which verse text should be taken.
 * @param keepNewlines If set to true, text will contain newlines if present in source, if set to false, newlines will be changed to spaces
 * @param newLinePrefix Prefix for each line of verse, if verse is multiline and keepNewLines = true
 * @returns Text of given verse.
 */
function getVerseText(verseNumber, headings, lines, keepNewlines, newLinePrefix) {
    if (verseNumber >= headings.length) { // out of range
        new Notice("Verse out of range for given file");
        throw `VerseNumber ${verseNumber} is out of range of headings with length ${headings.length}`;
    }
    const headingLine = headings[verseNumber].position.start.line;
    if (headingLine + 1 >= lines.length) { // out of range
        new Notice("Logical error - please create issue on plugin's GitHub with your input and the file you were referencing. Thank you!");
        throw `HeadingLine ${headingLine + 1} is out of range of lines with length ${lines}`;
    }
    // This part is necessary for verses that span over multiple lines
    let output = "";
    let line = "";
    let i = 1;
    let isFirst = true;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        line = lines[headingLine + i]; // get next line
        if (/^#/.test(line) || (!line && !isFirst)) {
            break; // heading line (next verse) or empty line after verse => do not continue
        }
        i++;
        if (line) { // if line has content (is not empty string)
            if (!isFirst) { // If it is not first line of the verse, add divider
                output += keepNewlines ? `\n${newLinePrefix}` : " ";
            }
            isFirst = false;
            output += line;
        }
    }
    return output;
}
/**
 * Replaces "\n" with newline character in given string (when user inputs "\n" in the settings it is automatically converted to "\\n" and does not work as newline)
 */
function replaceNewline(input) {
    return input.replace(/\\n/g, "\n");
}
/**
 * Takes orginal filename and converts it to human-readable version if Bible study kit is used (removes "-" and leading zeros)
 */
function createBookAndChapterOutput(fileBasename) {
    if (isOBSKFile.test(fileBasename)) {
        // eslint-disable-next-line prefer-const
        let [, filename, chapter] = fileBasename.match(isOBSKFile);
        if (chapter.toString()[0] === "0") {
            chapter = chapter.substring(1);
        }
        return filename + " " + chapter;
    }
    return fileBasename;
}
/**
 * Returns path to folder in which given file is located for main translation
 */
function getFileFolderInTranslation(app, filename, translation) {
    const tFileInfo = getTFileByFilename(app, filename, translation);
    return tFileInfo.tFile.parent.path;
}
function createCopyOutput(app, tFile, fileName, beginVerse, endVerse, settings, translationPath, linkOnly, verbose) {
    return __awaiter(this, void 0, void 0, function* () {
        const bookAndChapterOutput = createBookAndChapterOutput(tFile.basename);
        const file = app.vault.read(tFile);
        const lines = (yield file).split(/\r?\n/);
        const verseHeadingLevel = settings.verseHeadingLevel;
        const headings = app.metadataCache.getFileCache(tFile).headings.filter(heading => !verseHeadingLevel || heading.level === verseHeadingLevel);
        const beginVerseNoOffset = beginVerse;
        beginVerse += settings.verseOffset;
        endVerse += settings.verseOffset;
        const nrOfVerses = headings.length - 1;
        const maxVerse = endVerse < nrOfVerses ? endVerse : nrOfVerses; // if endverse is bigger than chapter allows, it is lowered to maximum
        const maxVerseNoOffset = maxVerse - settings.verseOffset;
        if (beginVerse > maxVerse) {
            if (verbose) {
                new Notice("Begin verse is bigger than end verse or chapter maximum");
            }
            throw "Begin verse is bigger than end verse or chapter maximum";
        }
        // 1 - Link to verses
        let postfix = "", res = "", pathToUse = "";
        if (!linkOnly) {
            res = settings.prefix;
            postfix = settings.postfix ? replaceNewline(settings.postfix) : " ";
        }
        if (settings.enableMultipleTranslations) {
            if (settings.translationLinkingType !== "main") // link the translation that is currently being used
                pathToUse = getFileFolderInTranslation(app, fileName, translationPath);
            else { // link main translation
                pathToUse = getFileFolderInTranslation(app, fileName, settings.parsedTranslationPaths.first());
            }
        }
        if (settings.newLines && !linkOnly) {
            res += `${settings.firstLinePrefix}`;
        }
        if (beginVerse === maxVerse) {
            res += `[[${pathToUse ? pathToUse + "/" : ""}${fileName}#${headings[beginVerse].heading}|${bookAndChapterOutput}${settings.oneVerseNotation}${beginVerseNoOffset}]]${postfix}`; // [[Gen 1#1|Gen 1,1.1]]
        }
        else if (settings.linkEndVerse) {
            res += `[[${pathToUse ? pathToUse + "/" : ""}${fileName}#${headings[beginVerse].heading}|${bookAndChapterOutput}${settings.multipleVersesNotation}${beginVerseNoOffset}-]]`; // [[Gen 1#1|Gen 1,1-]]
            res += `[[${pathToUse ? pathToUse + "/" : ""}${fileName}#${headings[maxVerse].heading}|${maxVerseNoOffset}]]${postfix}`; // [[Gen 1#3|3]]
        }
        else {
            res += `[[${pathToUse ? pathToUse + "/" : ""}${fileName}#${headings[beginVerse].heading}|${bookAndChapterOutput}${settings.multipleVersesNotation}${beginVerseNoOffset}-${maxVerseNoOffset}]]${postfix}`; // [[Gen 1#1|Gen 1,1-3]]
        }
        // 2 - Text of verses
        if (!linkOnly) {
            for (let i = beginVerse; i <= maxVerse; i++) {
                let versePrefix = "";
                const versePostfix = settings.insertSpace ? " " : "";
                if (settings.eachVersePrefix) {
                    versePrefix += settings.eachVersePrefix.replace(/{n}/g, (i - settings.verseOffset).toString());
                    versePrefix = versePrefix.replace(/{f}/g, `${fileName}`);
                }
                let verseText = getVerseText(i, headings, lines, settings.newLines, settings.prefix);
                if (settings.commentStart !== "" && settings.commentEnd !== "") {
                    const escapedStart = escapeForRegex(settings.commentStart);
                    const escapedEnd = escapeForRegex(settings.commentEnd);
                    const replaceRegex = new RegExp(`${escapedStart}.*?${escapedEnd}`, 'gs');
                    verseText = verseText.replace(replaceRegex, '');
                }
                if (settings.newLines) {
                    res += "\n" + settings.prefix + versePrefix + verseText;
                }
                else {
                    res += versePrefix + verseText + versePostfix;
                }
            }
        }
        // 3 - Invisible links
        if (!settings.useInvisibleLinks)
            return res;
        if ((beginVerse == maxVerse || (settings.linkEndVerse && beginVerse == maxVerse - 1)) // No need to add another link, when only one verse is being linked
            && (!settings.enableMultipleTranslations
                || settings.translationLinkingType === "main"
                || settings.translationLinkingType === "used")) // Only linking one translation - already linked 
            return res;
        if (settings.newLines && !linkOnly) {
            res += `\n${settings.prefix}`;
        }
        const lastVerseToLink = settings.linkEndVerse ? maxVerse - 1 : maxVerse;
        for (let i = beginVerse + 1; i <= lastVerseToLink; i++) { // beginVerse + 1 because link to first verse is already inserted before the text
            if (!settings.enableMultipleTranslations) {
                res += `[[${fileName}#${headings[i].heading}|]]`;
            }
            else { // multiple translations 
                let translationPathsToUse = [];
                switch (settings.translationLinkingType) {
                    case "all":
                        translationPathsToUse = settings.parsedTranslationPaths.map((tr) => getFileFolderInTranslation(app, fileName, tr));
                        break;
                    case "used":
                        translationPathsToUse = [getFileFolderInTranslation(app, fileName, translationPath)];
                        break;
                    case "usedAndMain":
                        if (translationPath !== settings.parsedTranslationPaths.first()) {
                            translationPathsToUse = [getFileFolderInTranslation(app, fileName, translationPath),
                                getFileFolderInTranslation(app, fileName, settings.parsedTranslationPaths.first())];
                        }
                        else {
                            translationPathsToUse = [getFileFolderInTranslation(app, fileName, translationPath)];
                        }
                        break;
                    case "main":
                        translationPathsToUse = [getFileFolderInTranslation(app, fileName, settings.parsedTranslationPaths.first())];
                        break;
                    default:
                        break;
                }
                translationPathsToUse.forEach((translationPath) => {
                    res += `[[${translationPath}/${fileName}#${headings[i].heading}|]]`;
                });
            }
        }
        return res;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weS1jb21tYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29weS1jb21tYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQXFCLE1BQU0sRUFBUyxNQUFNLFVBQVUsQ0FBQztBQUU1RCxPQUFPLEVBQUMsY0FBYyxFQUFFLFVBQVUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQzVELE9BQU8sRUFBRSxVQUFVLEVBQUUsaUJBQWlCLElBQUksa0JBQWtCLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFcEc7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sVUFBZ0IsZUFBZSxDQUFDLEdBQVEsRUFBRSxTQUFpQixFQUFFLFFBQXdCLEVBQUUsZUFBdUIsRUFBRSxRQUFpQixFQUFFLE9BQU8sR0FBRyxJQUFJOztRQUVuSix3Q0FBd0M7UUFDeEMsSUFBSSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZGLGNBQWMsR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUEsQ0FBQyx5QkFBeUI7UUFDckUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3JGLElBQUksS0FBSyxFQUFFO1lBQ1AsT0FBTyxNQUFNLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDM0g7YUFBTTtZQUNILElBQUksT0FBTyxFQUFFO2dCQUNULElBQUksTUFBTSxDQUFDLFFBQVEsY0FBYyxZQUFZLENBQUMsQ0FBQzthQUNsRDtZQUNELE1BQU0sZ0JBQWdCLENBQUE7U0FDekI7SUFDTCxDQUFD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SSxlQUFlLEtBQUssUUFBUSxDQUFDLHNCQUFzQixDQUFDLEtBQUssRUFBRSxFQUFFOzRCQUM3RCxxQkFBcUIsR0FBRyxDQUFDLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsZUFBZSxDQUFDO2dDQUNuRiwwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7eUJBQ3ZGOzZCQUNJOzRCQUNELHFCQUFxQixHQUFHLENBQUMsMEJBQTBCLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO3lCQUN4Rjt3QkFDRCxNQUFNO29CQUNWLEtBQUssTUFBTTt3QkFDUCxxQkFBcUIsR0FBRyxDQUFDLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLHNCQUFzQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDN0csTUFBTTtvQkFDVjt3QkFDSSxNQUFNO2lCQUNiO2dCQUNELHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDLGVBQWUsRUFBRSxFQUFFO29CQUM5QyxHQUFHLElBQUksS0FBSyxlQUFlLElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQTtnQkFDdkUsQ0FBQyxDQUFDLENBQUE7YUFDTDtTQUVKO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0NBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAsIEhlYWRpbmdDYWNoZSwgTm90aWNlLCBURmlsZSB9IGZyb20gXCJvYnNpZGlhblwiO1xyXG5pbXBvcnQgeyBQbHVnaW5TZXR0aW5ncyB9IGZyb20gXCIuLi9tYWluXCI7XHJcbmltcG9ydCB7ZXNjYXBlRm9yUmVnZXgsIGlzT0JTS0ZpbGV9IGZyb20gXCIuLi91dGlscy9yZWdleGVzXCI7XHJcbmltcG9ydCB7IGNhcGl0YWxpemUsIGdldEZpbGVCeUZpbGVuYW1lIGFzIGdldFRGaWxlQnlGaWxlbmFtZSwgcGFyc2VVc2VyVmVyc2VJbnB1dCB9IGZyb20gXCIuL2NvbW1vblwiO1xyXG5cclxuLyoqXHJcbiAqIENvbnZlcnRzIGJpYmxpY2FsIHJlZmVyZW5jZSB0byB0ZXh0IG9mIGdpdmVuIHZlcnNlc1xyXG4gKiBAcGFyYW0gYXBwIEFwcCBpbnN0YW5jZVxyXG4gKiBAcGFyYW0gdXNlcklucHV0IFVzZXIgSW5wdXQgKGxpbmsgdG8gdmVyc2UpXHJcbiAqIEBwYXJhbSBzZXR0aW5ncyBQbHVnaW4gc2V0dGluZ3NcclxuICogQHBhcmFtIHRyYW5zbGF0aW9uUGF0aCBQYXRoIHRvIHRyYW5zbGF0aW9uIHRoYXQgc2hvdWxkIGJlIHVzZWRcclxuICogQHBhcmFtIGxpbmtPbmx5IFdoZXRoZXIgdG8gaW5zZXJ0IG91dHB1dCBvbmx5IGxpbmsgb3IgYWxzbyBpbmNsdWRlIHRleHRcclxuICogQHBhcmFtIHZlcmJvc2UgV2hldGhlciBvciBub3QgdXNlciBzaG91bGQgYmUgbm90aWZpZWQgaWYgdGhlIGxpbmsgaXMgaW5jb3JyZWN0XHJcbiAqIEByZXR1cm5zIFN0cmluZyB3aXRoIHF1b3RlIG9mIGxpbmtlZCB2ZXJzZXMuIElmIGNvbnZlcnRpbmcgd2FzIG5vdCBzdWNjZXNzZnVsLCByZXR1cm5zIGVtcHR5IHN0cmluZy5cclxuICogQHZlcmJvc2UgRGV0ZXJtaW5lcyBpZiBOb3RpY2VzIHdpbGwgYmUgc2hvd24gb3Igbm90XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VGV4dE9mVmVyc2VzKGFwcDogQXBwLCB1c2VySW5wdXQ6IHN0cmluZywgc2V0dGluZ3M6IFBsdWdpblNldHRpbmdzLCB0cmFuc2xhdGlvblBhdGg6IHN0cmluZywgbGlua09ubHk6IGJvb2xlYW4sIHZlcmJvc2UgPSB0cnVlKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuXHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLWNvbnN0XHJcbiAgICBsZXQgeyBib29rQW5kQ2hhcHRlciwgYmVnaW5WZXJzZSwgZW5kVmVyc2UgfSA9IHBhcnNlVXNlclZlcnNlSW5wdXQodXNlcklucHV0LCB2ZXJib3NlKTtcclxuICAgIGJvb2tBbmRDaGFwdGVyID0gY2FwaXRhbGl6ZShib29rQW5kQ2hhcHRlcikgLy8gRm9yIG91dHB1dCBjb25zaXN0ZW5jeVxyXG4gICAgY29uc3QgeyBmaWxlTmFtZSwgdEZpbGUgfSA9IGdldFRGaWxlQnlGaWxlbmFtZShhcHAsIGJvb2tBbmRDaGFwdGVyLCB0cmFuc2xhdGlvblBhdGgpO1xyXG4gICAgaWYgKHRGaWxlKSB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGNyZWF0ZUNvcHlPdXRwdXQoYXBwLCB0RmlsZSwgZmlsZU5hbWUsIGJlZ2luVmVyc2UsIGVuZFZlcnNlLCBzZXR0aW5ncywgdHJhbnNsYXRpb25QYXRoLCBsaW5rT25seSwgdmVyYm9zZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmICh2ZXJib3NlKSB7XHJcbiAgICAgICAgICAgIG5ldyBOb3RpY2UoYEZpbGUgJHtib29rQW5kQ2hhcHRlcn0gbm90IGZvdW5kYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IFwiRmlsZSBub3QgZm91bmRcIlxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0ZXh0IG9mIGdpdmVuIHZlcnNlIHVzaW5nIGdpdmVuIGhlYWRpbmdzIGFuZCBsaW5lcy5cclxuICogQHBhcmFtIHZlcnNlTnVtYmVyIE51bWJlciBvZiBkZXNpcmVkIHZlcnNlLlxyXG4gKiBAcGFyYW0gaGVhZGluZ3MgTGlzdCBvZiBoZWFkaW5ncyB0aGF0IHNob3VsZCBiZSBzZWFyY2hlZC4gU2Vjb25kIGhlYWRpbmcgbXVzdCBjb3JyZXNwb25kIHRvIGZpcnN0IHZlcnNlLCB0aGlyZCBoZWFkaW5nIHRvIHNlY29uZCB2ZXJzZSBhbmQgc28gb24uXHJcbiAqIEBwYXJhbSBsaW5lcyBMaW5lcyBvZiBmaWxlIGZyb20gd2hpY2ggdmVyc2UgdGV4dCBzaG91bGQgYmUgdGFrZW4uXHJcbiAqIEBwYXJhbSBrZWVwTmV3bGluZXMgSWYgc2V0IHRvIHRydWUsIHRleHQgd2lsbCBjb250YWluIG5ld2xpbmVzIGlmIHByZXNlbnQgaW4gc291cmNlLCBpZiBzZXQgdG8gZmFsc2UsIG5ld2xpbmVzIHdpbGwgYmUgY2hhbmdlZCB0byBzcGFjZXNcclxuICogQHBhcmFtIG5ld0xpbmVQcmVmaXggUHJlZml4IGZvciBlYWNoIGxpbmUgb2YgdmVyc2UsIGlmIHZlcnNlIGlzIG11bHRpbGluZSBhbmQga2VlcE5ld0xpbmVzID0gdHJ1ZVxyXG4gKiBAcmV0dXJucyBUZXh0IG9mIGdpdmVuIHZlcnNlLlxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0VmVyc2VUZXh0KHZlcnNlTnVtYmVyOiBudW1iZXIsIGhlYWRpbmdzOiBIZWFkaW5nQ2FjaGVbXSwgbGluZXM6IHN0cmluZ1tdLCBrZWVwTmV3bGluZXM6IGJvb2xlYW4sIG5ld0xpbmVQcmVmaXg6IHN0cmluZykge1xyXG4gICAgaWYgKHZlcnNlTnVtYmVyID49IGhlYWRpbmdzLmxlbmd0aCkgeyAvLyBvdXQgb2YgcmFuZ2VcclxuICAgICAgICBuZXcgTm90aWNlKFwiVmVyc2Ugb3V0IG9mIHJhbmdlIGZvciBnaXZlbiBmaWxlXCIpXHJcbiAgICAgICAgdGhyb3cgYFZlcnNlTnVtYmVyICR7dmVyc2VOdW1iZXJ9IGlzIG91dCBvZiByYW5nZSBvZiBoZWFkaW5ncyB3aXRoIGxlbmd0aCAke2hlYWRpbmdzLmxlbmd0aH1gXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaGVhZGluZ0xpbmUgPSBoZWFkaW5nc1t2ZXJzZU51bWJlcl0ucG9zaXRpb24uc3RhcnQubGluZTtcclxuICAgIGlmIChoZWFkaW5nTGluZSArIDEgPj0gbGluZXMubGVuZ3RoKSB7IC8vIG91dCBvZiByYW5nZVxyXG4gICAgICAgIG5ldyBOb3RpY2UoXCJMb2dpY2FsIGVycm9yIC0gcGxlYXNlIGNyZWF0ZSBpc3N1ZSBvbiBwbHVnaW4ncyBHaXRIdWIgd2l0aCB5b3VyIGlucHV0IGFuZCB0aGUgZmlsZSB5b3Ugd2VyZSByZWZlcmVuY2luZy4gVGhhbmsgeW91IVwiKVxyXG4gICAgICAgIHRocm93IGBIZWFkaW5nTGluZSAke2hlYWRpbmdMaW5lICsgMX0gaXMgb3V0IG9mIHJhbmdlIG9mIGxpbmVzIHdpdGggbGVuZ3RoICR7bGluZXN9YFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoaXMgcGFydCBpcyBuZWNlc3NhcnkgZm9yIHZlcnNlcyB0aGF0IHNwYW4gb3ZlciBtdWx0aXBsZSBsaW5lc1xyXG4gICAgbGV0IG91dHB1dCA9IFwiXCI7XHJcbiAgICBsZXQgbGluZSA9IFwiXCI7XHJcbiAgICBsZXQgaSA9IDE7XHJcbiAgICBsZXQgaXNGaXJzdCA9IHRydWU7XHJcblxyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxyXG4gICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICBsaW5lID0gbGluZXNbaGVhZGluZ0xpbmUgKyBpXTsgLy8gZ2V0IG5leHQgbGluZVxyXG4gICAgICAgIGlmICgvXiMvLnRlc3QobGluZSkgfHwgKCFsaW5lICYmICFpc0ZpcnN0KSkge1xyXG4gICAgICAgICAgICBicmVhazsgLy8gaGVhZGluZyBsaW5lIChuZXh0IHZlcnNlKSBvciBlbXB0eSBsaW5lIGFmdGVyIHZlcnNlID0+IGRvIG5vdCBjb250aW51ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpKys7XHJcbiAgICAgICAgaWYgKGxpbmUpIHsgLy8gaWYgbGluZSBoYXMgY29udGVudCAoaXMgbm90IGVtcHR5IHN0cmluZylcclxuICAgICAgICAgICAgaWYgKCFpc0ZpcnN0KSB7IC8vIElmIGl0IGlzIG5vdCBmaXJzdCBsaW5lIG9mIHRoZSB2ZXJzZSwgYWRkIGRpdmlkZXJcclxuICAgICAgICAgICAgICAgIG91dHB1dCArPSBrZWVwTmV3bGluZXMgPyBgXFxuJHtuZXdMaW5lUHJlZml4fWAgOiBcIiBcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpc0ZpcnN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIG91dHB1dCArPSBsaW5lO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBvdXRwdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXBsYWNlcyBcIlxcblwiIHdpdGggbmV3bGluZSBjaGFyYWN0ZXIgaW4gZ2l2ZW4gc3RyaW5nICh3aGVuIHVzZXIgaW5wdXRzIFwiXFxuXCIgaW4gdGhlIHNldHRpbmdzIGl0IGlzIGF1dG9tYXRpY2FsbHkgY29udmVydGVkIHRvIFwiXFxcXG5cIiBhbmQgZG9lcyBub3Qgd29yayBhcyBuZXdsaW5lKVxyXG4gKi9cclxuZnVuY3Rpb24gcmVwbGFjZU5ld2xpbmUoaW5wdXQ6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIGlucHV0LnJlcGxhY2UoL1xcXFxuL2csIFwiXFxuXCIsKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRha2VzIG9yZ2luYWwgZmlsZW5hbWUgYW5kIGNvbnZlcnRzIGl0IHRvIGh1bWFuLXJlYWRhYmxlIHZlcnNpb24gaWYgQmlibGUgc3R1ZHkga2l0IGlzIHVzZWQgKHJlbW92ZXMgXCItXCIgYW5kIGxlYWRpbmcgemVyb3MpXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVCb29rQW5kQ2hhcHRlck91dHB1dChmaWxlQmFzZW5hbWU6IHN0cmluZykge1xyXG4gICAgaWYgKGlzT0JTS0ZpbGUudGVzdChmaWxlQmFzZW5hbWUpKSB7XHJcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1jb25zdFxyXG4gICAgICAgIGxldCBbLCBmaWxlbmFtZSwgY2hhcHRlcl0gPSBmaWxlQmFzZW5hbWUubWF0Y2goaXNPQlNLRmlsZSk7XHJcbiAgICAgICAgaWYgKGNoYXB0ZXIudG9TdHJpbmcoKVswXSA9PT0gXCIwXCIpIHtcclxuICAgICAgICAgICAgY2hhcHRlciA9IGNoYXB0ZXIuc3Vic3RyaW5nKDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmlsZW5hbWUgKyBcIiBcIiArIGNoYXB0ZXI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmlsZUJhc2VuYW1lO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBwYXRoIHRvIGZvbGRlciBpbiB3aGljaCBnaXZlbiBmaWxlIGlzIGxvY2F0ZWQgZm9yIG1haW4gdHJhbnNsYXRpb25cclxuICovXHJcbmZ1bmN0aW9uIGdldEZpbGVGb2xkZXJJblRyYW5zbGF0aW9uKGFwcDogQXBwLCBmaWxlbmFtZTogc3RyaW5nLCB0cmFuc2xhdGlvbjogc3RyaW5nKSB7XHJcbiAgICBjb25zdCB0RmlsZUluZm8gPSBnZXRURmlsZUJ5RmlsZW5hbWUoYXBwLCBmaWxlbmFtZSwgdHJhbnNsYXRpb24pO1xyXG4gICAgcmV0dXJuIHRGaWxlSW5mby50RmlsZS5wYXJlbnQucGF0aDtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlQ29weU91dHB1dChhcHA6IEFwcCwgdEZpbGU6IFRGaWxlLCBmaWxlTmFtZTogc3RyaW5nLCBiZWdpblZlcnNlOiBudW1iZXIsIGVuZFZlcnNlOiBudW1iZXIsIHNldHRpbmdzOiBQbHVnaW5TZXR0aW5ncywgdHJhbnNsYXRpb25QYXRoOiBzdHJpbmcsIGxpbmtPbmx5OiBib29sZWFuLCB2ZXJib3NlOiBib29sZWFuKSB7XHJcbiAgICBjb25zdCBib29rQW5kQ2hhcHRlck91dHB1dCA9IGNyZWF0ZUJvb2tBbmRDaGFwdGVyT3V0cHV0KHRGaWxlLmJhc2VuYW1lKTtcclxuICAgIGNvbnN0IGZpbGUgPSBhcHAudmF1bHQucmVhZCh0RmlsZSlcclxuICAgIGNvbnN0IGxpbmVzID0gKGF3YWl0IGZpbGUpLnNwbGl0KC9cXHI/XFxuLylcclxuICAgIGNvbnN0IHZlcnNlSGVhZGluZ0xldmVsID0gc2V0dGluZ3MudmVyc2VIZWFkaW5nTGV2ZWxcclxuICAgIGNvbnN0IGhlYWRpbmdzID0gYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKHRGaWxlKS5oZWFkaW5ncy5maWx0ZXIoaGVhZGluZyA9PiAhdmVyc2VIZWFkaW5nTGV2ZWwgfHwgaGVhZGluZy5sZXZlbCA9PT0gdmVyc2VIZWFkaW5nTGV2ZWwpXHJcbiAgICBjb25zdCBiZWdpblZlcnNlTm9PZmZzZXQgPSBiZWdpblZlcnNlXHJcbiAgICBiZWdpblZlcnNlICs9IHNldHRpbmdzLnZlcnNlT2Zmc2V0XHJcbiAgICBlbmRWZXJzZSArPSBzZXR0aW5ncy52ZXJzZU9mZnNldFxyXG5cdGNvbnN0IG5yT2ZWZXJzZXMgPSBoZWFkaW5ncy5sZW5ndGggLSAxO1xyXG5cdGNvbnN0IG1heFZlcnNlID0gZW5kVmVyc2UgPCBuck9mVmVyc2VzID8gZW5kVmVyc2UgOiBuck9mVmVyc2VzOyAvLyBpZiBlbmR2ZXJzZSBpcyBiaWdnZXIgdGhhbiBjaGFwdGVyIGFsbG93cywgaXQgaXMgbG93ZXJlZCB0byBtYXhpbXVtXHJcbiAgICBjb25zdCBtYXhWZXJzZU5vT2Zmc2V0ID0gbWF4VmVyc2UgLSBzZXR0aW5ncy52ZXJzZU9mZnNldDtcclxuXHJcblxyXG4gICAgaWYgKGJlZ2luVmVyc2UgPiBtYXhWZXJzZSkge1xyXG4gICAgICAgIGlmICh2ZXJib3NlKSB7XHJcbiAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJCZWdpbiB2ZXJzZSBpcyBiaWdnZXIgdGhhbiBlbmQgdmVyc2Ugb3IgY2hhcHRlciBtYXhpbXVtXCIpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IFwiQmVnaW4gdmVyc2UgaXMgYmlnZ2VyIHRoYW4gZW5kIHZlcnNlIG9yIGNoYXB0ZXIgbWF4aW11bVwiXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIDEgLSBMaW5rIHRvIHZlcnNlc1xyXG4gICAgbGV0IHBvc3RmaXggPSBcIlwiLCByZXMgPSBcIlwiLCBwYXRoVG9Vc2UgPSBcIlwiO1xyXG4gICAgaWYgKCFsaW5rT25seSkge1xyXG4gICAgICAgIHJlcyA9IHNldHRpbmdzLnByZWZpeDtcclxuICAgICAgICBwb3N0Zml4ID0gc2V0dGluZ3MucG9zdGZpeCA/IHJlcGxhY2VOZXdsaW5lKHNldHRpbmdzLnBvc3RmaXgpIDogXCIgXCI7XHJcbiAgICB9XHJcbiAgICBpZiAoc2V0dGluZ3MuZW5hYmxlTXVsdGlwbGVUcmFuc2xhdGlvbnMpIHtcclxuICAgICAgICBpZiAoc2V0dGluZ3MudHJhbnNsYXRpb25MaW5raW5nVHlwZSAhPT0gXCJtYWluXCIpIC8vIGxpbmsgdGhlIHRyYW5zbGF0aW9uIHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIHVzZWRcclxuICAgICAgICAgICAgcGF0aFRvVXNlID0gZ2V0RmlsZUZvbGRlckluVHJhbnNsYXRpb24oYXBwLCBmaWxlTmFtZSwgdHJhbnNsYXRpb25QYXRoKTtcclxuICAgICAgICBlbHNlIHsgLy8gbGluayBtYWluIHRyYW5zbGF0aW9uXHJcbiAgICAgICAgICAgIHBhdGhUb1VzZSA9IGdldEZpbGVGb2xkZXJJblRyYW5zbGF0aW9uKGFwcCwgZmlsZU5hbWUsIHNldHRpbmdzLnBhcnNlZFRyYW5zbGF0aW9uUGF0aHMuZmlyc3QoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHRpZiAoc2V0dGluZ3MubmV3TGluZXMgJiYgIWxpbmtPbmx5KSB7XHJcblx0XHRyZXMgKz0gYCR7c2V0dGluZ3MuZmlyc3RMaW5lUHJlZml4fWBcclxuXHR9XHJcblxyXG4gICAgaWYgKGJlZ2luVmVyc2UgPT09IG1heFZlcnNlKSB7XHJcbiAgICAgICAgcmVzICs9IGBbWyR7cGF0aFRvVXNlID8gcGF0aFRvVXNlICsgXCIvXCIgOiBcIlwifSR7ZmlsZU5hbWV9IyR7aGVhZGluZ3NbYmVnaW5WZXJzZV0uaGVhZGluZ318JHtib29rQW5kQ2hhcHRlck91dHB1dH0ke3NldHRpbmdzLm9uZVZlcnNlTm90YXRpb259JHtiZWdpblZlcnNlTm9PZmZzZXR9XV0ke3Bvc3RmaXh9YCAvLyBbW0dlbiAxIzF8R2VuIDEsMS4xXV1cclxuICAgIH0gZWxzZSBpZiAoc2V0dGluZ3MubGlua0VuZFZlcnNlKSB7XHJcbiAgICAgICAgcmVzICs9IGBbWyR7cGF0aFRvVXNlID8gcGF0aFRvVXNlICsgXCIvXCIgOiBcIlwifSR7ZmlsZU5hbWV9IyR7aGVhZGluZ3NbYmVnaW5WZXJzZV0uaGVhZGluZ318JHtib29rQW5kQ2hhcHRlck91dHB1dH0ke3NldHRpbmdzLm11bHRpcGxlVmVyc2VzTm90YXRpb259JHtiZWdpblZlcnNlTm9PZmZzZXR9LV1dYCAvLyBbW0dlbiAxIzF8R2VuIDEsMS1dXVxyXG4gICAgICAgIHJlcyArPSBgW1ske3BhdGhUb1VzZSA/IHBhdGhUb1VzZSArIFwiL1wiIDogXCJcIn0ke2ZpbGVOYW1lfSMke2hlYWRpbmdzW21heFZlcnNlXS5oZWFkaW5nfXwke21heFZlcnNlTm9PZmZzZXR9XV0ke3Bvc3RmaXh9YDsgLy8gW1tHZW4gMSMzfDNdXVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXMgKz0gYFtbJHtwYXRoVG9Vc2UgPyBwYXRoVG9Vc2UgKyBcIi9cIiA6IFwiXCJ9JHtmaWxlTmFtZX0jJHtoZWFkaW5nc1tiZWdpblZlcnNlXS5oZWFkaW5nfXwke2Jvb2tBbmRDaGFwdGVyT3V0cHV0fSR7c2V0dGluZ3MubXVsdGlwbGVWZXJzZXNOb3RhdGlvbn0ke2JlZ2luVmVyc2VOb09mZnNldH0tJHttYXhWZXJzZU5vT2Zmc2V0fV1dJHtwb3N0Zml4fWAgLy8gW1tHZW4gMSMxfEdlbiAxLDEtM11dXHJcbiAgICB9XHJcblxyXG4gICAgLy8gMiAtIFRleHQgb2YgdmVyc2VzXHJcbiAgICBpZiAoIWxpbmtPbmx5KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IGJlZ2luVmVyc2U7IGkgPD0gbWF4VmVyc2U7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgdmVyc2VQcmVmaXggPSBcIlwiO1xyXG4gICAgICAgICAgICBjb25zdCB2ZXJzZVBvc3RmaXggPSBzZXR0aW5ncy5pbnNlcnRTcGFjZSA/IFwiIFwiIDogXCJcIjtcclxuICAgICAgICAgICAgaWYgKHNldHRpbmdzLmVhY2hWZXJzZVByZWZpeCkge1xyXG4gICAgICAgICAgICAgICAgdmVyc2VQcmVmaXggKz0gc2V0dGluZ3MuZWFjaFZlcnNlUHJlZml4LnJlcGxhY2UoL3tufS9nLCAoaSAtIHNldHRpbmdzLnZlcnNlT2Zmc2V0KS50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgICAgIHZlcnNlUHJlZml4ID0gdmVyc2VQcmVmaXgucmVwbGFjZSgve2Z9L2csIGAke2ZpbGVOYW1lfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCB2ZXJzZVRleHQgPSBnZXRWZXJzZVRleHQoaSwgaGVhZGluZ3MsIGxpbmVzLCBzZXR0aW5ncy5uZXdMaW5lcywgc2V0dGluZ3MucHJlZml4KTtcclxuXHJcblx0XHRcdGlmIChzZXR0aW5ncy5jb21tZW50U3RhcnQgIT09IFwiXCIgJiYgc2V0dGluZ3MuY29tbWVudEVuZCAhPT0gXCJcIikge1xyXG5cdFx0XHRcdGNvbnN0IGVzY2FwZWRTdGFydCA9IGVzY2FwZUZvclJlZ2V4KHNldHRpbmdzLmNvbW1lbnRTdGFydCk7XHJcblx0XHRcdFx0Y29uc3QgZXNjYXBlZEVuZCA9IGVzY2FwZUZvclJlZ2V4KHNldHRpbmdzLmNvbW1lbnRFbmQpO1xyXG5cdFx0XHRcdGNvbnN0IHJlcGxhY2VSZWdleCA9IG5ldyBSZWdFeHAoYCR7ZXNjYXBlZFN0YXJ0fS4qPyR7ZXNjYXBlZEVuZH1gLCAnZ3MnKTtcclxuXHRcdFx0XHR2ZXJzZVRleHQgPSB2ZXJzZVRleHQucmVwbGFjZShyZXBsYWNlUmVnZXgsICcnKTtcclxuXHRcdFx0fVxyXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MubmV3TGluZXMpIHtcclxuICAgICAgICAgICAgICAgIHJlcyArPSBcIlxcblwiICsgc2V0dGluZ3MucHJlZml4ICsgdmVyc2VQcmVmaXggKyB2ZXJzZVRleHQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXMgKz0gdmVyc2VQcmVmaXggKyB2ZXJzZVRleHQgKyB2ZXJzZVBvc3RmaXg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gMyAtIEludmlzaWJsZSBsaW5rc1xyXG4gICAgaWYgKCFzZXR0aW5ncy51c2VJbnZpc2libGVMaW5rcykgcmV0dXJuIHJlcztcclxuICAgIGlmICgoYmVnaW5WZXJzZSA9PSBtYXhWZXJzZSB8fCAoc2V0dGluZ3MubGlua0VuZFZlcnNlICYmIGJlZ2luVmVyc2UgPT0gbWF4VmVyc2UgLSAxKSkgLy8gTm8gbmVlZCB0byBhZGQgYW5vdGhlciBsaW5rLCB3aGVuIG9ubHkgb25lIHZlcnNlIGlzIGJlaW5nIGxpbmtlZFxyXG4gICAgICAgICYmICghc2V0dGluZ3MuZW5hYmxlTXVsdGlwbGVUcmFuc2xhdGlvbnNcclxuICAgICAgICAgICAgfHwgc2V0dGluZ3MudHJhbnNsYXRpb25MaW5raW5nVHlwZSA9PT0gXCJtYWluXCJcclxuICAgICAgICAgICAgfHwgc2V0dGluZ3MudHJhbnNsYXRpb25MaW5raW5nVHlwZSA9PT0gXCJ1c2VkXCIpKSAvLyBPbmx5IGxpbmtpbmcgb25lIHRyYW5zbGF0aW9uIC0gYWxyZWFkeSBsaW5rZWQgXHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuXHJcbiAgICBpZiAoc2V0dGluZ3MubmV3TGluZXMgJiYgIWxpbmtPbmx5KSB7XHJcbiAgICAgICAgcmVzICs9IGBcXG4ke3NldHRpbmdzLnByZWZpeH1gO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxhc3RWZXJzZVRvTGluayA9IHNldHRpbmdzLmxpbmtFbmRWZXJzZSA/IG1heFZlcnNlIC0gMSA6IG1heFZlcnNlO1xyXG4gICAgZm9yIChsZXQgaSA9IGJlZ2luVmVyc2UgKyAxOyBpIDw9IGxhc3RWZXJzZVRvTGluazsgaSsrKSB7IC8vIGJlZ2luVmVyc2UgKyAxIGJlY2F1c2UgbGluayB0byBmaXJzdCB2ZXJzZSBpcyBhbHJlYWR5IGluc2VydGVkIGJlZm9yZSB0aGUgdGV4dFxyXG4gICAgICAgIGlmICghc2V0dGluZ3MuZW5hYmxlTXVsdGlwbGVUcmFuc2xhdGlvbnMpIHtcclxuICAgICAgICAgICAgcmVzICs9IGBbWyR7ZmlsZU5hbWV9IyR7aGVhZGluZ3NbaV0uaGVhZGluZ318XV1gXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgeyAvLyBtdWx0aXBsZSB0cmFuc2xhdGlvbnMgXHJcbiAgICAgICAgICAgIGxldCB0cmFuc2xhdGlvblBhdGhzVG9Vc2U6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgICAgIHN3aXRjaCAoc2V0dGluZ3MudHJhbnNsYXRpb25MaW5raW5nVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcImFsbFwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uUGF0aHNUb1VzZSA9IHNldHRpbmdzLnBhcnNlZFRyYW5zbGF0aW9uUGF0aHMubWFwKCh0cikgPT4gZ2V0RmlsZUZvbGRlckluVHJhbnNsYXRpb24oYXBwLCBmaWxlTmFtZSwgdHIpKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcInVzZWRcIjpcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblBhdGhzVG9Vc2UgPSBbZ2V0RmlsZUZvbGRlckluVHJhbnNsYXRpb24oYXBwLCBmaWxlTmFtZSwgdHJhbnNsYXRpb25QYXRoKV1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJ1c2VkQW5kTWFpblwiOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc2xhdGlvblBhdGggIT09IHNldHRpbmdzLnBhcnNlZFRyYW5zbGF0aW9uUGF0aHMuZmlyc3QoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblBhdGhzVG9Vc2UgPSBbZ2V0RmlsZUZvbGRlckluVHJhbnNsYXRpb24oYXBwLCBmaWxlTmFtZSwgdHJhbnNsYXRpb25QYXRoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0RmlsZUZvbGRlckluVHJhbnNsYXRpb24oYXBwLCBmaWxlTmFtZSwgc2V0dGluZ3MucGFyc2VkVHJhbnNsYXRpb25QYXRocy5maXJzdCgpKV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblBhdGhzVG9Vc2UgPSBbZ2V0RmlsZUZvbGRlckluVHJhbnNsYXRpb24oYXBwLCBmaWxlTmFtZSwgdHJhbnNsYXRpb25QYXRoKV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcIm1haW5cIjpcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblBhdGhzVG9Vc2UgPSBbZ2V0RmlsZUZvbGRlckluVHJhbnNsYXRpb24oYXBwLCBmaWxlTmFtZSwgc2V0dGluZ3MucGFyc2VkVHJhbnNsYXRpb25QYXRocy5maXJzdCgpKV07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uUGF0aHNUb1VzZS5mb3JFYWNoKCh0cmFuc2xhdGlvblBhdGgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlcyArPSBgW1ske3RyYW5zbGF0aW9uUGF0aH0vJHtmaWxlTmFtZX0jJHtoZWFkaW5nc1tpXS5oZWFkaW5nfXxdXWBcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxufVxyXG4iXX0=