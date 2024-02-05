import { __awaiter } from "tslib";
import { Notice } from "obsidian";
import { LinkType } from "../modals/link-verse-modal";
import { multipleChapters } from "../utils/regexes";
import expandBibleBookName from "../utils/expandedBookName";
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
        let formattedInput = expandBibleBookName(userInput);
        if (linkType === LinkType.Invisible) {
            res += `${beginning}[[${bookAndChapter}${settings.linkSeparator}${settings.versePrefix}${beginVerse}${ending}${formattedInput}]]`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluay1jb21tYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGluay1jb21tYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQU8sTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUV0RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNwRCxPQUFPLG1CQUFtQixNQUFNLDJCQUEyQixDQUFBO0FBQzNELE9BQU8sRUFDTixVQUFVLEVBQ1YsaUJBQWlCLEVBQ2pCLGtCQUFrQixFQUNsQixtQkFBbUIsR0FDbkIsTUFBTSxVQUFVLENBQUM7QUFFbEI7Ozs7Ozs7R0FPRztBQUNILE1BQU0sVUFBZ0IsV0FBVyxDQUNoQyxHQUFRLEVBQ1IsU0FBaUIsRUFDakIsUUFBa0IsRUFDbEIsVUFBbUIsRUFDbkIsUUFBd0I7O1FBRXhCLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3JDLE9BQU8sbUJBQW1CLENBQ3pCLEdBQUcsRUFDSCxTQUFTLEVBQ1QsUUFBUSxFQUNSLFVBQVUsRUFDVixRQUFRLENBQ1IsQ0FBQztTQUNGO2FBQU07WUFDTixPQUFPLGlCQUFpQixDQUN2QixHQUFHLEVBQ0gsU0FBUyxFQUNULFFBQVEsRUFDUixVQUFVLEVBQ1YsUUFBUSxDQUNSLENBQUM7U0FDRjtJQUNGLENBQUM7Q0FBQTtBQUVEOztHQUVHO0FBQ0gsU0FBZSxpQkFBaUIsQ0FDL0IsR0FBUSxFQUNSLFNBQWlCLEVBQ2pCLFFBQWtCLEVBQ2xCLFVBQW1CLEVBQ25CLFFBQXdCOztRQUV4Qix3Q0FBd0M7UUFDeEMsSUFBSSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEdBQzNDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hDLElBQUksUUFBUSxDQUFDLHlCQUF5QixFQUFFO1lBQ3ZDLGNBQWMsR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyx5QkFBeUI7U0FDdEU7UUFDRCxJQUFJLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRTtZQUNwQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNuRSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNYLElBQUksTUFBTSxDQUNULFNBQVMsUUFBUSxrREFBa0QsQ0FDbkUsQ0FBQztnQkFDRixNQUFNLFFBQVEsUUFBUSxzQ0FBc0MsQ0FBQzthQUM3RDtTQUNEO1FBRUQsSUFBSSxVQUFVLEdBQUcsUUFBUSxFQUFFO1lBQzFCLElBQUksTUFBTSxDQUFDLHNDQUFzQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxzQ0FBc0MsQ0FBQztTQUM3QztRQUVELElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNiLE1BQU0sU0FBUyxHQUFHLFFBQVEsS0FBSyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM1RCxNQUFNLE1BQU0sR0FBRyxRQUFRLEtBQUssUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFekQsSUFBSSxjQUFjLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFckQsSUFBSSxRQUFRLEtBQUssUUFBUSxDQUFDLFNBQVMsRUFBRTtZQUNwQyxHQUFHLElBQUksR0FBRyxTQUFTLEtBQUssY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLFdBQVcsR0FBRyxVQUFVLEdBQUcsTUFBTSxHQUFHLGNBQWMsSUFBSSxDQUFDO1NBQ2xJO2FBQU07WUFDTixHQUFHLElBQUksR0FBRyxTQUFTLEtBQUssY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLFdBQVcsR0FBRyxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUM7U0FDakg7UUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLFVBQVUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM5QyxHQUFHLElBQUksR0FBRyxTQUFTLEtBQUssY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLFdBQVcsR0FBRyxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUM7WUFDeEcsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsR0FBRyxJQUFJLElBQUksQ0FBQzthQUNaO1NBQ0Q7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7Q0FBQTtBQUVEOztHQUVHO0FBQ0gsU0FBZSxtQkFBbUIsQ0FDakMsR0FBUSxFQUNSLFNBQWlCLEVBQ2pCLFFBQWtCLEVBQ2xCLFVBQW1CLEVBQ25CLFFBQXdCOztRQUV4QixNQUFNLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxRSxJQUFJLFlBQVksR0FBRyxXQUFXLEVBQUU7WUFDL0IsSUFBSSxNQUFNLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxNQUFNLDBDQUEwQyxDQUFDO1NBQ2pEO1FBRUQsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2IsS0FBSyxJQUFJLENBQUMsR0FBRyxZQUFZLEVBQUUsQ0FBQyxJQUFJLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNqRCxHQUFHLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDMUIsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsR0FBRyxJQUFJLElBQUksQ0FBQzthQUNaO1NBQ0Q7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcCwgTm90aWNlIH0gZnJvbSBcIm9ic2lkaWFuXCI7XHJcbmltcG9ydCB7IExpbmtUeXBlIH0gZnJvbSBcIi4uL21vZGFscy9saW5rLXZlcnNlLW1vZGFsXCI7XHJcbmltcG9ydCB7IFBsdWdpblNldHRpbmdzIH0gZnJvbSBcIi4uL21haW5cIjtcclxuaW1wb3J0IHsgbXVsdGlwbGVDaGFwdGVycyB9IGZyb20gXCIuLi91dGlscy9yZWdleGVzXCI7XHJcbmltcG9ydCBleHBhbmRCaWJsZUJvb2tOYW1lIGZyb20gXCIuLi91dGlscy9leHBhbmRlZEJvb2tOYW1lXCJcclxuaW1wb3J0IHtcclxuXHRjYXBpdGFsaXplLFxyXG5cdGdldEZpbGVCeUZpbGVuYW1lLFxyXG5cdHBhcnNlVXNlckJvb2tJbnB1dCxcclxuXHRwYXJzZVVzZXJWZXJzZUlucHV0LFxyXG59IGZyb20gXCIuL2NvbW1vblwiO1xyXG5cclxuLyoqXHJcbiAqIENvbnZlcnRzIGJpYmxpY2FsIHJlZmVyZW5jZSB0byBsaW5rcyB0byBnaXZlbiB2ZXJzZXMgb3IgYm9va3NcclxuICogQHBhcmFtIGFwcCBBcHAgaW5zdGFuY2VcclxuICogQHBhcmFtIHVzZXJJbnB1dCBVc2VyIElucHV0IChsaW5rIHRvIHZlcnNlIG9yIGNoYXB0ZXIpXHJcbiAqIEBwYXJhbSBsaW5rVHlwZSBUeXBlIG9mIGxpbmsgdGhhdCBzaG91bGQgYmUgdXNlZFxyXG4gKiBAcGFyYW0gdXNlTmV3TGluZSBXaGV0aGVyIG9yIG5vdCBzaG91bGQgZWFjaCBsaW5rIGJlIG9uIG5ldyBsaW5lXHJcbiAqIEByZXR1cm5zIFN0cmluZyB3aXRoIHF1b3RlIG9mIGxpbmtlZCB2ZXJzZXMuIElmIGNvbnZlcnRpbmcgd2FzIG5vdCBzdWNjZXNzZnVsLCByZXR1cm5zIGVtcHR5IHN0cmluZy5cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVMaW5rcyhcclxuXHRhcHA6IEFwcCxcclxuXHR1c2VySW5wdXQ6IHN0cmluZyxcclxuXHRsaW5rVHlwZTogTGlua1R5cGUsXHJcblx0dXNlTmV3TGluZTogYm9vbGVhbixcclxuXHRzZXR0aW5nczogUGx1Z2luU2V0dGluZ3NcclxuKSB7XHJcblx0aWYgKG11bHRpcGxlQ2hhcHRlcnMudGVzdCh1c2VySW5wdXQpKSB7XHJcblx0XHRyZXR1cm4gZ2V0TGlua3NGb3JDaGFwdGVycyhcclxuXHRcdFx0YXBwLFxyXG5cdFx0XHR1c2VySW5wdXQsXHJcblx0XHRcdGxpbmtUeXBlLFxyXG5cdFx0XHR1c2VOZXdMaW5lLFxyXG5cdFx0XHRzZXR0aW5nc1xyXG5cdFx0KTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIGdldExpbmtzRm9yVmVyc2VzKFxyXG5cdFx0XHRhcHAsXHJcblx0XHRcdHVzZXJJbnB1dCxcclxuXHRcdFx0bGlua1R5cGUsXHJcblx0XHRcdHVzZU5ld0xpbmUsXHJcblx0XHRcdHNldHRpbmdzXHJcblx0XHQpO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgY29weSBjb21tYW5kIG91dHB1dCB3aGVuIGxpbmtpbmcgbXVsdGlwbGUgdmVyc2VzXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRMaW5rc0ZvclZlcnNlcyhcclxuXHRhcHA6IEFwcCxcclxuXHR1c2VySW5wdXQ6IHN0cmluZyxcclxuXHRsaW5rVHlwZTogTGlua1R5cGUsXHJcblx0dXNlTmV3TGluZTogYm9vbGVhbixcclxuXHRzZXR0aW5nczogUGx1Z2luU2V0dGluZ3NcclxuKSB7XHJcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1jb25zdFxyXG5cdGxldCB7IGJvb2tBbmRDaGFwdGVyLCBiZWdpblZlcnNlLCBlbmRWZXJzZSB9ID1cclxuXHRcdHBhcnNlVXNlclZlcnNlSW5wdXQodXNlcklucHV0KTtcclxuXHRpZiAoc2V0dGluZ3Muc2hvdWxkQ2FwaXRhbGl6ZUJvb2tOYW1lcykge1xyXG5cdFx0Ym9va0FuZENoYXB0ZXIgPSBjYXBpdGFsaXplKGJvb2tBbmRDaGFwdGVyKTsgLy8gRm9yIG91dHB1dCBjb25zaXN0ZW5jeVxyXG5cdH1cclxuXHRpZiAoc2V0dGluZ3MudmVyaWZ5RmlsZXNXaGVuTGlua2luZykge1xyXG5cdFx0Y29uc3QgeyBmaWxlTmFtZSwgdEZpbGUgfSA9IGdldEZpbGVCeUZpbGVuYW1lKGFwcCwgYm9va0FuZENoYXB0ZXIpO1xyXG5cdFx0aWYgKCF0RmlsZSkge1xyXG5cdFx0XHRuZXcgTm90aWNlKFxyXG5cdFx0XHRcdGBGaWxlIFwiJHtmaWxlTmFtZX1cIiBkb2VzIG5vdCBleGlzdCBhbmQgdmVyaWZ5IGZpbGVzIGlzIHNldCB0byB0cnVlYFxyXG5cdFx0XHQpO1xyXG5cdFx0XHR0aHJvdyBgRmlsZSAke2ZpbGVOYW1lfSBkb2VzIG5vdCBleGlzdCwgdmVyaWZ5IGZpbGVzID0gdHJ1ZWA7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRpZiAoYmVnaW5WZXJzZSA+IGVuZFZlcnNlKSB7XHJcblx0XHRuZXcgTm90aWNlKFwiQmVnaW4gdmVyc2UgaXMgYmlnZ2VyIHRoYW4gZW5kIHZlcnNlXCIpO1xyXG5cdFx0dGhyb3cgXCJCZWdpbiB2ZXJzZSBpcyBiaWdnZXIgdGhhbiBlbmQgdmVyc2VcIjtcclxuXHR9XHJcblxyXG5cdGxldCByZXMgPSBcIlwiO1xyXG5cdGNvbnN0IGJlZ2lubmluZyA9IGxpbmtUeXBlID09PSBMaW5rVHlwZS5FbWJlZGRlZCA/IFwiIVwiIDogXCJcIjtcclxuXHRjb25zdCBlbmRpbmcgPSBsaW5rVHlwZSA9PT0gTGlua1R5cGUuSW52aXNpYmxlID8gXCJ8XCIgOiBcIlwiO1xyXG5cclxuICBsZXQgZm9ybWF0dGVkSW5wdXQgPSBleHBhbmRCaWJsZUJvb2tOYW1lKHVzZXJJbnB1dCk7XHJcblx0XHJcblx0aWYgKGxpbmtUeXBlID09PSBMaW5rVHlwZS5JbnZpc2libGUpIHtcclxuXHRcdHJlcyArPSBgJHtiZWdpbm5pbmd9W1ske2Jvb2tBbmRDaGFwdGVyfSR7c2V0dGluZ3MubGlua1NlcGFyYXRvcn0ke3NldHRpbmdzLnZlcnNlUHJlZml4fSR7YmVnaW5WZXJzZX0ke2VuZGluZ30ke2Zvcm1hdHRlZElucHV0fV1dYDtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmVzICs9IGAke2JlZ2lubmluZ31bWyR7Ym9va0FuZENoYXB0ZXJ9JHtzZXR0aW5ncy5saW5rU2VwYXJhdG9yfSR7c2V0dGluZ3MudmVyc2VQcmVmaXh9JHtiZWdpblZlcnNlfSR7ZW5kaW5nfV1dYDtcclxuXHR9XHJcblx0XHJcblx0Zm9yIChsZXQgaSA9IGJlZ2luVmVyc2UrMTsgaSA8PSBlbmRWZXJzZTsgaSsrKSB7XHJcblx0XHRyZXMgKz0gYCR7YmVnaW5uaW5nfVtbJHtib29rQW5kQ2hhcHRlcn0ke3NldHRpbmdzLmxpbmtTZXBhcmF0b3J9JHtzZXR0aW5ncy52ZXJzZVByZWZpeH0ke2l9JHtlbmRpbmd9XV1gO1xyXG5cdFx0aWYgKHVzZU5ld0xpbmUpIHtcclxuXHRcdFx0cmVzICs9IFwiXFxuXCI7XHJcblx0XHR9XHJcblx0fVxyXG5cdHJldHVybiByZXM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGNvcHkgY29tbWFuZCBvdXRwdXQgd2hlbiBsaW5raW5nIG11bHRpcGxlIGNoYXB0ZXJzXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRMaW5rc0ZvckNoYXB0ZXJzKFxyXG5cdGFwcDogQXBwLFxyXG5cdHVzZXJJbnB1dDogc3RyaW5nLFxyXG5cdGxpbmtUeXBlOiBMaW5rVHlwZSxcclxuXHR1c2VOZXdMaW5lOiBib29sZWFuLFxyXG5cdHNldHRpbmdzOiBQbHVnaW5TZXR0aW5nc1xyXG4pIHtcclxuXHRjb25zdCB7IGJvb2ssIGZpcnN0Q2hhcHRlciwgbGFzdENoYXB0ZXIgfSA9IHBhcnNlVXNlckJvb2tJbnB1dCh1c2VySW5wdXQpO1xyXG5cdGlmIChmaXJzdENoYXB0ZXIgPiBsYXN0Q2hhcHRlcikge1xyXG5cdFx0bmV3IE5vdGljZShcIkJlZ2luIGNoYXB0ZXIgaXMgYmlnZ2VyIHRoYW4gZW5kIGNoYXB0ZXJcIik7XHJcblx0XHR0aHJvdyBcIkJlZ2luIGNoYXB0ZXIgaXMgYmlnZ2VyIHRoYW4gZW5kIGNoYXB0ZXJcIjtcclxuXHR9XHJcblxyXG5cdGxldCByZXMgPSBcIlwiO1xyXG5cdGZvciAobGV0IGkgPSBmaXJzdENoYXB0ZXI7IGkgPD0gbGFzdENoYXB0ZXI7IGkrKykge1xyXG5cdFx0cmVzICs9IGBbWyR7Ym9va30gJHtpfV1dYDtcclxuXHRcdGlmICh1c2VOZXdMaW5lKSB7XHJcblx0XHRcdHJlcyArPSBcIlxcblwiO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRyZXR1cm4gcmVzO1xyXG59Il19