import { __awaiter } from "tslib";
import { Notice } from "obsidian";
import { LinkType } from "../modals/link-verse-modal";
import { multipleChapters } from "../utils/regexes";
import { capitalize, getFileByFilename, parseUserBookInput, parseUserVerseInput, } from "./common";
/**
 * Converts biblical reference to links to given verses or books
 * @param app App instance
 * @param userInput User Input (link to verse or chapter)
 * @param linkType Type of link that should be used
 * @param useNewLine Whether or not should each link be on new line
 * @returns String with quote of linked verses. If converting was not successful, returns empty string.
 */
export function createLinks(app, userInput, linkType, useNewLine, settings) {
    return __awaiter(this, void 0, void 0, function* () {
        if (multipleChapters.test(userInput)) {
            return getLinksForChapters(app, userInput, linkType, useNewLine, settings);
        }
        else {
            return getLinksForVerses(app, userInput, linkType, useNewLine, settings);
        }
    });
}
/**
 * Creates copy command output when linking multiple verses
 */
function getLinksForVerses(app, userInput, linkType, useNewLine, settings) {
    return __awaiter(this, void 0, void 0, function* () {
        // eslint-disable-next-line prefer-const
        let { bookAndChapter, beginVerse, endVerse } = parseUserVerseInput(userInput);
        if (settings.shouldCapitalizeBookNames) {
            bookAndChapter = capitalize(bookAndChapter); // For output consistency
        }
        if (settings.verifyFilesWhenLinking) {
            const { fileName, tFile } = getFileByFilename(app, bookAndChapter);
            if (!tFile) {
                new Notice(`File "${fileName}" does not exist and verify files is set to true`);
                throw `File ${fileName} does not exist, verify files = true`;
            }
        }
        if (beginVerse > endVerse) {
            new Notice("Begin verse is bigger than end verse");
            throw "Begin verse is bigger than end verse";
        }
        let res = "";
        const beginning = linkType === LinkType.Embedded ? "!" : "";
        const ending = linkType === LinkType.Invisible ? "|" : "";
        if (linkType === LinkType.Invisible) {
            res += `${beginning}[[${bookAndChapter}${settings.linkSeparator}${settings.versePrefix}${beginVerse}${ending}${userInput}]]`;
        }
        else {
            res += `${beginning}[[${bookAndChapter}${settings.linkSeparator}${settings.versePrefix}${beginVerse}${ending}]]`;
        }
        for (let i = beginVerse + 1; i <= endVerse; i++) {
            res += `${beginning}[[${bookAndChapter}${settings.linkSeparator}${settings.versePrefix}${i}${ending}]]`;
            if (useNewLine) {
                res += "\n";
            }
        }
        return res;
    });
}
/**
 * Creates copy command output when linking multiple chapters
 */
function getLinksForChapters(app, userInput, linkType, useNewLine, settings) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluay1jb21tYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGluay1jb21tYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQU8sTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUV0RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNwRCxPQUFPLEVBQ04sVUFBVSxFQUNWLGlCQUFpQixFQUNqQixrQkFBa0IsRUFDbEIsbUJBQW1CLEdBQ25CLE1BQU0sVUFBVSxDQUFDO0FBRWxCOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQWdCLFdBQVcsQ0FDaEMsR0FBUSxFQUNSLFNBQWlCLEVBQ2pCLFFBQWtCLEVBQ2xCLFVBQW1CLEVBQ25CLFFBQXdCOztRQUV4QixJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNyQyxPQUFPLG1CQUFtQixDQUN6QixHQUFHLEVBQ0gsU0FBUyxFQUNULFFBQVEsRUFDUixVQUFVLEVBQ1YsUUFBUSxDQUNSLENBQUM7U0FDRjthQUFNO1lBQ04sT0FBTyxpQkFBaUIsQ0FDdkIsR0FBRyxFQUNILFNBQVMsRUFDVCxRQUFRLEVBQ1IsVUFBVSxFQUNWLFFBQVEsQ0FDUixDQUFDO1NBQ0Y7SUFDRixDQUFDO0NBQUE7QUFFRDs7R0FFRztBQUNILFNBQWUsaUJBQWlCLENBQy9CLEdBQVEsRUFDUixTQUFpQixFQUNqQixRQUFrQixFQUNsQixVQUFtQixFQUNuQixRQUF3Qjs7UUFFeEIsd0NBQXdDO1FBQ3hDLElBQUksRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxHQUMzQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoQyxJQUFJLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRTtZQUN2QyxjQUFjLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMseUJBQXlCO1NBQ3RFO1FBQ0QsSUFBSSxRQUFRLENBQUMsc0JBQXNCLEVBQUU7WUFDcEMsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDWCxJQUFJLE1BQU0sQ0FDVCxTQUFTLFFBQVEsa0RBQWtELENBQ25FLENBQUM7Z0JBQ0YsTUFBTSxRQUFRLFFBQVEsc0NBQXNDLENBQUM7YUFDN0Q7U0FDRDtRQUVELElBQUksVUFBVSxHQUFHLFFBQVEsRUFBRTtZQUMxQixJQUFJLE1BQU0sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sc0NBQXNDLENBQUM7U0FDN0M7UUFFRCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDYixNQUFNLFNBQVMsR0FBRyxRQUFRLEtBQUssUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDNUQsTUFBTSxNQUFNLEdBQUcsUUFBUSxLQUFLLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRTFELElBQUksUUFBUSxLQUFLLFFBQVEsQ0FBQyxTQUFTLEVBQUU7WUFDcEMsR0FBRyxJQUFJLEdBQUcsU0FBUyxLQUFLLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxXQUFXLEdBQUcsVUFBVSxHQUFHLE1BQU0sR0FBRyxTQUFTLElBQUksQ0FBQztTQUM3SDthQUFNO1lBQ04sR0FBRyxJQUFJLEdBQUcsU0FBUyxLQUFLLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxXQUFXLEdBQUcsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDO1NBQ2pIO1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxVQUFVLEdBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDOUMsR0FBRyxJQUFJLEdBQUcsU0FBUyxLQUFLLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDO1lBQ3hHLElBQUksVUFBVSxFQUFFO2dCQUNmLEdBQUcsSUFBSSxJQUFJLENBQUM7YUFDWjtTQUNEO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0NBQUE7QUFFRDs7R0FFRztBQUNILFNBQWUsbUJBQW1CLENBQ2pDLEdBQVEsRUFDUixTQUFpQixFQUNqQixRQUFrQixFQUNsQixVQUFtQixFQUNuQixRQUF3Qjs7UUFFeEIsTUFBTSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLEdBQUcsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUUsSUFBSSxZQUFZLEdBQUcsV0FBVyxFQUFFO1lBQy9CLElBQUksTUFBTSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsTUFBTSwwQ0FBMEMsQ0FBQztTQUNqRDtRQUVELElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNiLEtBQUssSUFBSSxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUMsSUFBSSxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDakQsR0FBRyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQzFCLElBQUksVUFBVSxFQUFFO2dCQUNmLEdBQUcsSUFBSSxJQUFJLENBQUM7YUFDWjtTQUNEO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0NBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAsIE5vdGljZSB9IGZyb20gXCJvYnNpZGlhblwiO1xyXG5pbXBvcnQgeyBMaW5rVHlwZSB9IGZyb20gXCIuLi9tb2RhbHMvbGluay12ZXJzZS1tb2RhbFwiO1xyXG5pbXBvcnQgeyBQbHVnaW5TZXR0aW5ncyB9IGZyb20gXCIuLi9tYWluXCI7XHJcbmltcG9ydCB7IG11bHRpcGxlQ2hhcHRlcnMgfSBmcm9tIFwiLi4vdXRpbHMvcmVnZXhlc1wiO1xyXG5pbXBvcnQge1xyXG5cdGNhcGl0YWxpemUsXHJcblx0Z2V0RmlsZUJ5RmlsZW5hbWUsXHJcblx0cGFyc2VVc2VyQm9va0lucHV0LFxyXG5cdHBhcnNlVXNlclZlcnNlSW5wdXQsXHJcbn0gZnJvbSBcIi4vY29tbW9uXCI7XHJcblxyXG4vKipcclxuICogQ29udmVydHMgYmlibGljYWwgcmVmZXJlbmNlIHRvIGxpbmtzIHRvIGdpdmVuIHZlcnNlcyBvciBib29rc1xyXG4gKiBAcGFyYW0gYXBwIEFwcCBpbnN0YW5jZVxyXG4gKiBAcGFyYW0gdXNlcklucHV0IFVzZXIgSW5wdXQgKGxpbmsgdG8gdmVyc2Ugb3IgY2hhcHRlcilcclxuICogQHBhcmFtIGxpbmtUeXBlIFR5cGUgb2YgbGluayB0aGF0IHNob3VsZCBiZSB1c2VkXHJcbiAqIEBwYXJhbSB1c2VOZXdMaW5lIFdoZXRoZXIgb3Igbm90IHNob3VsZCBlYWNoIGxpbmsgYmUgb24gbmV3IGxpbmVcclxuICogQHJldHVybnMgU3RyaW5nIHdpdGggcXVvdGUgb2YgbGlua2VkIHZlcnNlcy4gSWYgY29udmVydGluZyB3YXMgbm90IHN1Y2Nlc3NmdWwsIHJldHVybnMgZW1wdHkgc3RyaW5nLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUxpbmtzKFxyXG5cdGFwcDogQXBwLFxyXG5cdHVzZXJJbnB1dDogc3RyaW5nLFxyXG5cdGxpbmtUeXBlOiBMaW5rVHlwZSxcclxuXHR1c2VOZXdMaW5lOiBib29sZWFuLFxyXG5cdHNldHRpbmdzOiBQbHVnaW5TZXR0aW5nc1xyXG4pIHtcclxuXHRpZiAobXVsdGlwbGVDaGFwdGVycy50ZXN0KHVzZXJJbnB1dCkpIHtcclxuXHRcdHJldHVybiBnZXRMaW5rc0ZvckNoYXB0ZXJzKFxyXG5cdFx0XHRhcHAsXHJcblx0XHRcdHVzZXJJbnB1dCxcclxuXHRcdFx0bGlua1R5cGUsXHJcblx0XHRcdHVzZU5ld0xpbmUsXHJcblx0XHRcdHNldHRpbmdzXHJcblx0XHQpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gZ2V0TGlua3NGb3JWZXJzZXMoXHJcblx0XHRcdGFwcCxcclxuXHRcdFx0dXNlcklucHV0LFxyXG5cdFx0XHRsaW5rVHlwZSxcclxuXHRcdFx0dXNlTmV3TGluZSxcclxuXHRcdFx0c2V0dGluZ3NcclxuXHRcdCk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBjb3B5IGNvbW1hbmQgb3V0cHV0IHdoZW4gbGlua2luZyBtdWx0aXBsZSB2ZXJzZXNcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldExpbmtzRm9yVmVyc2VzKFxyXG5cdGFwcDogQXBwLFxyXG5cdHVzZXJJbnB1dDogc3RyaW5nLFxyXG5cdGxpbmtUeXBlOiBMaW5rVHlwZSxcclxuXHR1c2VOZXdMaW5lOiBib29sZWFuLFxyXG5cdHNldHRpbmdzOiBQbHVnaW5TZXR0aW5nc1xyXG4pIHtcclxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLWNvbnN0XHJcblx0bGV0IHsgYm9va0FuZENoYXB0ZXIsIGJlZ2luVmVyc2UsIGVuZFZlcnNlIH0gPVxyXG5cdFx0cGFyc2VVc2VyVmVyc2VJbnB1dCh1c2VySW5wdXQpO1xyXG5cdGlmIChzZXR0aW5ncy5zaG91bGRDYXBpdGFsaXplQm9va05hbWVzKSB7XHJcblx0XHRib29rQW5kQ2hhcHRlciA9IGNhcGl0YWxpemUoYm9va0FuZENoYXB0ZXIpOyAvLyBGb3Igb3V0cHV0IGNvbnNpc3RlbmN5XHJcblx0fVxyXG5cdGlmIChzZXR0aW5ncy52ZXJpZnlGaWxlc1doZW5MaW5raW5nKSB7XHJcblx0XHRjb25zdCB7IGZpbGVOYW1lLCB0RmlsZSB9ID0gZ2V0RmlsZUJ5RmlsZW5hbWUoYXBwLCBib29rQW5kQ2hhcHRlcik7XHJcblx0XHRpZiAoIXRGaWxlKSB7XHJcblx0XHRcdG5ldyBOb3RpY2UoXHJcblx0XHRcdFx0YEZpbGUgXCIke2ZpbGVOYW1lfVwiIGRvZXMgbm90IGV4aXN0IGFuZCB2ZXJpZnkgZmlsZXMgaXMgc2V0IHRvIHRydWVgXHJcblx0XHRcdCk7XHJcblx0XHRcdHRocm93IGBGaWxlICR7ZmlsZU5hbWV9IGRvZXMgbm90IGV4aXN0LCB2ZXJpZnkgZmlsZXMgPSB0cnVlYDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGlmIChiZWdpblZlcnNlID4gZW5kVmVyc2UpIHtcclxuXHRcdG5ldyBOb3RpY2UoXCJCZWdpbiB2ZXJzZSBpcyBiaWdnZXIgdGhhbiBlbmQgdmVyc2VcIik7XHJcblx0XHR0aHJvdyBcIkJlZ2luIHZlcnNlIGlzIGJpZ2dlciB0aGFuIGVuZCB2ZXJzZVwiO1xyXG5cdH1cclxuXHJcblx0bGV0IHJlcyA9IFwiXCI7XHJcblx0Y29uc3QgYmVnaW5uaW5nID0gbGlua1R5cGUgPT09IExpbmtUeXBlLkVtYmVkZGVkID8gXCIhXCIgOiBcIlwiO1xyXG5cdGNvbnN0IGVuZGluZyA9IGxpbmtUeXBlID09PSBMaW5rVHlwZS5JbnZpc2libGUgPyBcInxcIiA6IFwiXCI7XHJcblx0XHJcblx0aWYgKGxpbmtUeXBlID09PSBMaW5rVHlwZS5JbnZpc2libGUpIHtcclxuXHRcdHJlcyArPSBgJHtiZWdpbm5pbmd9W1ske2Jvb2tBbmRDaGFwdGVyfSR7c2V0dGluZ3MubGlua1NlcGFyYXRvcn0ke3NldHRpbmdzLnZlcnNlUHJlZml4fSR7YmVnaW5WZXJzZX0ke2VuZGluZ30ke3VzZXJJbnB1dH1dXWA7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJlcyArPSBgJHtiZWdpbm5pbmd9W1ske2Jvb2tBbmRDaGFwdGVyfSR7c2V0dGluZ3MubGlua1NlcGFyYXRvcn0ke3NldHRpbmdzLnZlcnNlUHJlZml4fSR7YmVnaW5WZXJzZX0ke2VuZGluZ31dXWA7XHJcblx0fVxyXG5cdFxyXG5cdGZvciAobGV0IGkgPSBiZWdpblZlcnNlKzE7IGkgPD0gZW5kVmVyc2U7IGkrKykge1xyXG5cdFx0cmVzICs9IGAke2JlZ2lubmluZ31bWyR7Ym9va0FuZENoYXB0ZXJ9JHtzZXR0aW5ncy5saW5rU2VwYXJhdG9yfSR7c2V0dGluZ3MudmVyc2VQcmVmaXh9JHtpfSR7ZW5kaW5nfV1dYDtcclxuXHRcdGlmICh1c2VOZXdMaW5lKSB7XHJcblx0XHRcdHJlcyArPSBcIlxcblwiO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRyZXR1cm4gcmVzO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBjb3B5IGNvbW1hbmQgb3V0cHV0IHdoZW4gbGlua2luZyBtdWx0aXBsZSBjaGFwdGVyc1xyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0TGlua3NGb3JDaGFwdGVycyhcclxuXHRhcHA6IEFwcCxcclxuXHR1c2VySW5wdXQ6IHN0cmluZyxcclxuXHRsaW5rVHlwZTogTGlua1R5cGUsXHJcblx0dXNlTmV3TGluZTogYm9vbGVhbixcclxuXHRzZXR0aW5nczogUGx1Z2luU2V0dGluZ3NcclxuKSB7XHJcblx0Y29uc3QgeyBib29rLCBmaXJzdENoYXB0ZXIsIGxhc3RDaGFwdGVyIH0gPSBwYXJzZVVzZXJCb29rSW5wdXQodXNlcklucHV0KTtcclxuXHRpZiAoZmlyc3RDaGFwdGVyID4gbGFzdENoYXB0ZXIpIHtcclxuXHRcdG5ldyBOb3RpY2UoXCJCZWdpbiBjaGFwdGVyIGlzIGJpZ2dlciB0aGFuIGVuZCBjaGFwdGVyXCIpO1xyXG5cdFx0dGhyb3cgXCJCZWdpbiBjaGFwdGVyIGlzIGJpZ2dlciB0aGFuIGVuZCBjaGFwdGVyXCI7XHJcblx0fVxyXG5cclxuXHRsZXQgcmVzID0gXCJcIjtcclxuXHRmb3IgKGxldCBpID0gZmlyc3RDaGFwdGVyOyBpIDw9IGxhc3RDaGFwdGVyOyBpKyspIHtcclxuXHRcdHJlcyArPSBgW1ske2Jvb2t9ICR7aX1dXWA7XHJcblx0XHRpZiAodXNlTmV3TGluZSkge1xyXG5cdFx0XHRyZXMgKz0gXCJcXG5cIjtcclxuXHRcdH1cclxuXHR9XHJcblx0cmV0dXJuIHJlcztcclxufSJdfQ==