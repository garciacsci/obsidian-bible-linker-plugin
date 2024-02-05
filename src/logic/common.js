/*
 * Capitalizes given string (skips leading whitespaces and numbers)
 */
import { bookAndChapterRegexForOBSK, multipleChapters, multipleVersesRegEx, oneVerseRegEx, } from "../utils/regexes";
import { Notice } from "obsidian";
/**
 * Capitalizes given string, taking leading numbers into account
 * @param str String that should be capitalized
 */
export function capitalize(str) {
    str = str.toLocaleLowerCase();
    for (let i = 0; i < str.length; i++) {
        if (/[^\s\d.,#-]/.test(str.charAt(i))) {
            return (str.slice(0, i) + str.charAt(i).toUpperCase() + str.slice(i + 1));
        }
    }
    return str;
}
/**
 * Parses input from user, expecting chapter and verses
 * @param userInput
 * @param verbose Whether or not user should be notified if the link is incorrect
 */
export function parseUserVerseInput(userInput, verbose = true) {
    let bookAndChapter;
    let beginVerse;
    let endVerse;
    switch (true) {
        case oneVerseRegEx.test(userInput): {
            // one verse
            const [, matchedChapter, matchedVerse] = userInput.match(oneVerseRegEx);
            bookAndChapter = matchedChapter;
            beginVerse = Number(matchedVerse);
            endVerse = Number(matchedVerse);
            break;
        }
        case multipleVersesRegEx.test(userInput): {
            // multiple verses, one chapter
            const [, matchedChapter, matchedBeginVerse, matchedEndVerse] = userInput.match(multipleVersesRegEx);
            bookAndChapter = matchedChapter;
            beginVerse = Number(matchedBeginVerse);
            endVerse = Number(matchedEndVerse);
            break;
        }
        default: {
            if (verbose) {
                new Notice(`Wrong format "${userInput}"`);
            }
            throw "Could not parse user input";
        }
    }
    return { bookAndChapter, beginVerse, endVerse };
}
/**
 * Parses input from user, expecting multiple chapters
 * @param userInput
 */
export function parseUserBookInput(userInput) {
    let book;
    let firstChapter;
    let lastChapter;
    switch (true) {
        case multipleChapters.test(userInput): {
            // one verse
            const [, matchedBook, matchedFirstChapter, matchedLastChapter] = userInput.match(multipleChapters);
            book = matchedBook.trim();
            firstChapter = Number(matchedFirstChapter);
            lastChapter = Number(matchedLastChapter);
            break;
        }
        default: {
            new Notice(`Wrong format "${userInput}"`);
            throw "Could not parse user input";
        }
    }
    return { book, firstChapter, lastChapter };
}
/**
 * Tries to get tFile corresponding to given filename. If the file is not found, filename is converted to match Obsidian
 * Bible Study Kit naming convention and the operation is repeated.
 * @param app
 * @param filename Name of file that should be searched
 * @param path Path where the search should occure
 */
export function getFileByFilename(app, filename, path = "/") {
    let filenameCopy = filename;
    let tFile = app.metadataCache.getFirstLinkpathDest(filenameCopy, path);
    if (!tFile) {
        // handle "Bible study kit" file naming, eg. Gen-01 instead of Gen 1
        filenameCopy = tryConvertToOBSKFileName(filenameCopy);
        tFile = app.metadataCache.getFirstLinkpathDest(filenameCopy, path);
    }
    return { fileName: filenameCopy, tFile };
}
/**
 * Tries to convert file name to Obsidian Study Kit file name
 * @param bookAndChapter File name that should be converted
 * @returns file name in Obsidain Study Kit naming system
 */
export function tryConvertToOBSKFileName(bookAndChapter) {
    if (bookAndChapterRegexForOBSK.test(bookAndChapter)) {
        // Valid chapter name
        // eslint-disable-next-line prefer-const
        let [, book, number] = bookAndChapter.match(bookAndChapterRegexForOBSK);
        if (number.length == 1) {
            number = `0${number}`;
        }
        return `${book}-${number}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBQ0gsT0FBTyxFQUNOLDBCQUEwQixFQUMxQixnQkFBZ0IsRUFDaEIsbUJBQW1CLEVBQ25CLGFBQWEsR0FDYixNQUFNLGtCQUFrQixDQUFDO0FBQzFCLE9BQU8sRUFBTyxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdkM7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLFVBQVUsQ0FBQyxHQUFXO0lBQ3JDLEdBQUcsR0FBRyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUM5QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNwQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3RDLE9BQU8sQ0FDTixHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUNoRSxDQUFDO1NBQ0Y7S0FDRDtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ1osQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsbUJBQW1CLENBQUMsU0FBaUIsRUFBRSxPQUFPLEdBQUcsSUFBSTtJQUNwRSxJQUFJLGNBQWMsQ0FBQztJQUNuQixJQUFJLFVBQVUsQ0FBQztJQUNmLElBQUksUUFBUSxDQUFDO0lBRWIsUUFBUSxJQUFJLEVBQUU7UUFDYixLQUFLLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNuQyxZQUFZO1lBQ1osTUFBTSxDQUFDLEVBQUUsY0FB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QUFJLEVBQUUsTUFBTSxDQUFDLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ3hFLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFDdkIsTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7U0FDdEI7UUFDRCxPQUFPLEdBQUcsSUFBSSxJQUFJLE1BQU0sRUFBRSxDQUFDO0tBQzNCO0FBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXHJcbiAqIENhcGl0YWxpemVzIGdpdmVuIHN0cmluZyAoc2tpcHMgbGVhZGluZyB3aGl0ZXNwYWNlcyBhbmQgbnVtYmVycylcclxuICovXHJcbmltcG9ydCB7XHJcblx0Ym9va0FuZENoYXB0ZXJSZWdleEZvck9CU0ssXHJcblx0bXVsdGlwbGVDaGFwdGVycyxcclxuXHRtdWx0aXBsZVZlcnNlc1JlZ0V4LFxyXG5cdG9uZVZlcnNlUmVnRXgsXHJcbn0gZnJvbSBcIi4uL3V0aWxzL3JlZ2V4ZXNcIjtcclxuaW1wb3J0IHsgQXBwLCBOb3RpY2UgfSBmcm9tIFwib2JzaWRpYW5cIjtcclxuXHJcbi8qKlxyXG4gKiBDYXBpdGFsaXplcyBnaXZlbiBzdHJpbmcsIHRha2luZyBsZWFkaW5nIG51bWJlcnMgaW50byBhY2NvdW50XHJcbiAqIEBwYXJhbSBzdHIgU3RyaW5nIHRoYXQgc2hvdWxkIGJlIGNhcGl0YWxpemVkXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZShzdHI6IHN0cmluZykge1xyXG5cdHN0ciA9IHN0ci50b0xvY2FsZUxvd2VyQ2FzZSgpO1xyXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRpZiAoL1teXFxzXFxkLiwjLV0vLnRlc3Qoc3RyLmNoYXJBdChpKSkpIHtcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHRzdHIuc2xpY2UoMCwgaSkgKyBzdHIuY2hhckF0KGkpLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoaSArIDEpXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdHJldHVybiBzdHI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQYXJzZXMgaW5wdXQgZnJvbSB1c2VyLCBleHBlY3RpbmcgY2hhcHRlciBhbmQgdmVyc2VzXHJcbiAqIEBwYXJhbSB1c2VySW5wdXRcclxuICogQHBhcmFtIHZlcmJvc2UgV2hldGhlciBvciBub3QgdXNlciBzaG91bGQgYmUgbm90aWZpZWQgaWYgdGhlIGxpbmsgaXMgaW5jb3JyZWN0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VVc2VyVmVyc2VJbnB1dCh1c2VySW5wdXQ6IHN0cmluZywgdmVyYm9zZSA9IHRydWUpIHtcclxuXHRsZXQgYm9va0FuZENoYXB0ZXI7XHJcblx0bGV0IGJlZ2luVmVyc2U7XHJcblx0bGV0IGVuZFZlcnNlO1xyXG5cclxuXHRzd2l0Y2ggKHRydWUpIHtcclxuXHRcdGNhc2Ugb25lVmVyc2VSZWdFeC50ZXN0KHVzZXJJbnB1dCk6IHtcclxuXHRcdFx0Ly8gb25lIHZlcnNlXHJcblx0XHRcdGNvbnN0IFssIG1hdGNoZWRDaGFwdGVyLCBtYXRjaGVkVmVyc2VdID1cclxuXHRcdFx0XHR1c2VySW5wdXQubWF0Y2gob25lVmVyc2VSZWdFeCk7XHJcblx0XHRcdGJvb2tBbmRDaGFwdGVyID0gbWF0Y2hlZENoYXB0ZXI7XHJcblx0XHRcdGJlZ2luVmVyc2UgPSBOdW1iZXIobWF0Y2hlZFZlcnNlKTtcclxuXHRcdFx0ZW5kVmVyc2UgPSBOdW1iZXIobWF0Y2hlZFZlcnNlKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHRjYXNlIG11bHRpcGxlVmVyc2VzUmVnRXgudGVzdCh1c2VySW5wdXQpOiB7XHJcblx0XHRcdC8vIG11bHRpcGxlIHZlcnNlcywgb25lIGNoYXB0ZXJcclxuXHRcdFx0Y29uc3QgWywgbWF0Y2hlZENoYXB0ZXIsIG1hdGNoZWRCZWdpblZlcnNlLCBtYXRjaGVkRW5kVmVyc2VdID1cclxuXHRcdFx0XHR1c2VySW5wdXQubWF0Y2gobXVsdGlwbGVWZXJzZXNSZWdFeCk7XHJcblx0XHRcdGJvb2tBbmRDaGFwdGVyID0gbWF0Y2hlZENoYXB0ZXI7XHJcblx0XHRcdGJlZ2luVmVyc2UgPSBOdW1iZXIobWF0Y2hlZEJlZ2luVmVyc2UpO1xyXG5cdFx0XHRlbmRWZXJzZSA9IE51bWJlcihtYXRjaGVkRW5kVmVyc2UpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHRcdGRlZmF1bHQ6IHtcclxuXHRcdFx0aWYgKHZlcmJvc2UpIHtcclxuXHRcdFx0XHRuZXcgTm90aWNlKGBXcm9uZyBmb3JtYXQgXCIke3VzZXJJbnB1dH1cImApO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRocm93IFwiQ291bGQgbm90IHBhcnNlIHVzZXIgaW5wdXRcIjtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJldHVybiB7IGJvb2tBbmRDaGFwdGVyLCBiZWdpblZlcnNlLCBlbmRWZXJzZSB9O1xyXG59XHJcblxyXG4vKipcclxuICogUGFyc2VzIGlucHV0IGZyb20gdXNlciwgZXhwZWN0aW5nIG11bHRpcGxlIGNoYXB0ZXJzXHJcbiAqIEBwYXJhbSB1c2VySW5wdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVVzZXJCb29rSW5wdXQodXNlcklucHV0OiBzdHJpbmcpIHtcclxuXHRsZXQgYm9vaztcclxuXHRsZXQgZmlyc3RDaGFwdGVyO1xyXG5cdGxldCBsYXN0Q2hhcHRlcjtcclxuXHJcblx0c3dpdGNoICh0cnVlKSB7XHJcblx0XHRjYXNlIG11bHRpcGxlQ2hhcHRlcnMudGVzdCh1c2VySW5wdXQpOiB7XHJcblx0XHRcdC8vIG9uZSB2ZXJzZVxyXG5cdFx0XHRjb25zdCBbLCBtYXRjaGVkQm9vaywgbWF0Y2hlZEZpcnN0Q2hhcHRlciwgbWF0Y2hlZExhc3RDaGFwdGVyXSA9XHJcblx0XHRcdFx0dXNlcklucHV0Lm1hdGNoKG11bHRpcGxlQ2hhcHRlcnMpO1xyXG5cdFx0XHRib29rID0gbWF0Y2hlZEJvb2sudHJpbSgpO1xyXG5cdFx0XHRmaXJzdENoYXB0ZXIgPSBOdW1iZXIobWF0Y2hlZEZpcnN0Q2hhcHRlcik7XHJcblx0XHRcdGxhc3RDaGFwdGVyID0gTnVtYmVyKG1hdGNoZWRMYXN0Q2hhcHRlcik7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdFx0ZGVmYXVsdDoge1xyXG5cdFx0XHRuZXcgTm90aWNlKGBXcm9uZyBmb3JtYXQgXCIke3VzZXJJbnB1dH1cImApO1xyXG5cdFx0XHR0aHJvdyBcIkNvdWxkIG5vdCBwYXJzZSB1c2VyIGlucHV0XCI7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4geyBib29rLCBmaXJzdENoYXB0ZXIsIGxhc3RDaGFwdGVyIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmllcyB0byBnZXQgdEZpbGUgY29ycmVzcG9uZGluZyB0byBnaXZlbiBmaWxlbmFtZS4gSWYgdGhlIGZpbGUgaXMgbm90IGZvdW5kLCBmaWxlbmFtZSBpcyBjb252ZXJ0ZWQgdG8gbWF0Y2ggT2JzaWRpYW5cclxuICogQmlibGUgU3R1ZHkgS2l0IG5hbWluZyBjb252ZW50aW9uIGFuZCB0aGUgb3BlcmF0aW9uIGlzIHJlcGVhdGVkLlxyXG4gKiBAcGFyYW0gYXBwXHJcbiAqIEBwYXJhbSBmaWxlbmFtZSBOYW1lIG9mIGZpbGUgdGhhdCBzaG91bGQgYmUgc2VhcmNoZWRcclxuICogQHBhcmFtIHBhdGggUGF0aCB3aGVyZSB0aGUgc2VhcmNoIHNob3VsZCBvY2N1cmVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWxlQnlGaWxlbmFtZShhcHA6IEFwcCwgZmlsZW5hbWU6IHN0cmluZywgcGF0aCA9IFwiL1wiKSB7XHJcblx0bGV0IGZpbGVuYW1lQ29weSA9IGZpbGVuYW1lO1xyXG5cdGxldCB0RmlsZSA9IGFwcC5tZXRhZGF0YUNhY2hlLmdldEZpcnN0TGlua3BhdGhEZXN0KGZpbGVuYW1lQ29weSwgcGF0aCk7XHJcblx0aWYgKCF0RmlsZSkge1xyXG5cdFx0Ly8gaGFuZGxlIFwiQmlibGUgc3R1ZHkga2l0XCIgZmlsZSBuYW1pbmcsIGVnLiBHZW4tMDEgaW5zdGVhZCBvZiBHZW4gMVxyXG5cdFx0ZmlsZW5hbWVDb3B5ID0gdHJ5Q29udmVydFRvT0JTS0ZpbGVOYW1lKGZpbGVuYW1lQ29weSk7XHJcblx0XHR0RmlsZSA9IGFwcC5tZXRhZGF0YUNhY2hlLmdldEZpcnN0TGlua3BhdGhEZXN0KGZpbGVuYW1lQ29weSwgcGF0aCk7XHJcblx0fVxyXG5cdHJldHVybiB7IGZpbGVOYW1lOiBmaWxlbmFtZUNvcHksIHRGaWxlIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmllcyB0byBjb252ZXJ0IGZpbGUgbmFtZSB0byBPYnNpZGlhbiBTdHVkeSBLaXQgZmlsZSBuYW1lXHJcbiAqIEBwYXJhbSBib29rQW5kQ2hhcHRlciBGaWxlIG5hbWUgdGhhdCBzaG91bGQgYmUgY29udmVydGVkXHJcbiAqIEByZXR1cm5zIGZpbGUgbmFtZSBpbiBPYnNpZGFpbiBTdHVkeSBLaXQgbmFtaW5nIHN5c3RlbVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRyeUNvbnZlcnRUb09CU0tGaWxlTmFtZShib29rQW5kQ2hhcHRlcjogc3RyaW5nKSB7XHJcblx0aWYgKGJvb2tBbmRDaGFwdGVyUmVnZXhGb3JPQlNLLnRlc3QoYm9va0FuZENoYXB0ZXIpKSB7XHJcblx0XHQvLyBWYWxpZCBjaGFwdGVyIG5hbWVcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItY29uc3RcclxuXHRcdGxldCBbLCBib29rLCBudW1iZXJdID0gYm9va0FuZENoYXB0ZXIubWF0Y2goYm9va0FuZENoYXB0ZXJSZWdleEZvck9CU0spO1xyXG5cdFx0aWYgKG51bWJlci5sZW5ndGggPT0gMSkge1xyXG5cdFx0XHRudW1iZXIgPSBgMCR7bnVtYmVyfWA7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gYCR7Ym9va30tJHtudW1iZXJ9YDtcclxuXHR9XHJcbn1cclxuIl19