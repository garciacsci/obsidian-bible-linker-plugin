/*
* Regexes for verse parsing
*/
// Link to one verse, for example "Gen 1.1" or "Gen 1:1"
export const oneVerseRegEx = new RegExp(/([^,:#]+)[,#.:;]\s*(\d+)\s*$/);
// Link to multiple verses, for example "Gen 1,1-5"
export const multipleVersesRegEx = new RegExp(/([^,:#]+)[,#.:;]\s*(\d+)\s*[-.=]\s*(\d+)\s*$/);
// Book and chapter string (used for converting to bible study kit file names)
export const bookAndChapterRegexForOBSK = /([^,:#]+)\s(\d+)/;
// Multiple chapters, for example "Gen 1-3"
export const multipleChapters = /(\d*[^\d,:#]+)\s*(\d+)\s*-\s*(\d+)\s*$/;
// Can be used to determine whether given name of file is from OBSK (for example Gen-01)
export const isOBSKFile = /([A-zÀ-ž0-9 ]+)-(\d{2,3})/;
// Escapes given string so that it can be safely used in regular expression
export function escapeForRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnZXhlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlZ2V4ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0VBRUU7QUFFRix3REFBd0Q7QUFDeEQsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksTUFBTSxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFFeEUsbURBQW1EO0FBQ25ELE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLElBQUksTUFBTSxDQUFDLDhDQUE4QyxDQUFDLENBQUM7QUFFOUYsOEVBQThFO0FBQzlFLE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUFHLGtCQUFrQixDQUFBO0FBRTVELDJDQUEyQztBQUMzQyxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyx3Q0FBd0MsQ0FBQTtBQUV4RSx3RkFBd0Y7QUFDeEYsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHLDJCQUEyQixDQUFBO0FBRXJELDJFQUEyRTtBQUMzRSxNQUFNLFVBQVUsY0FBYyxDQUFDLE1BQWM7SUFDNUMsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsb0NBQW9DO0FBQzNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4qIFJlZ2V4ZXMgZm9yIHZlcnNlIHBhcnNpbmdcclxuKi9cclxuXHJcbi8vIExpbmsgdG8gb25lIHZlcnNlLCBmb3IgZXhhbXBsZSBcIkdlbiAxLjFcIiBvciBcIkdlbiAxOjFcIlxyXG5leHBvcnQgY29uc3Qgb25lVmVyc2VSZWdFeCA9IG5ldyBSZWdFeHAoLyhbXiw6I10rKVssIy46O11cXHMqKFxcZCspXFxzKiQvKTtcclxuXHJcbi8vIExpbmsgdG8gbXVsdGlwbGUgdmVyc2VzLCBmb3IgZXhhbXBsZSBcIkdlbiAxLDEtNVwiXHJcbmV4cG9ydCBjb25zdCBtdWx0aXBsZVZlcnNlc1JlZ0V4ID0gbmV3IFJlZ0V4cCgvKFteLDojXSspWywjLjo7XVxccyooXFxkKylcXHMqWy0uPV1cXHMqKFxcZCspXFxzKiQvKTtcclxuXHJcbi8vIEJvb2sgYW5kIGNoYXB0ZXIgc3RyaW5nICh1c2VkIGZvciBjb252ZXJ0aW5nIHRvIGJpYmxlIHN0dWR5IGtpdCBmaWxlIG5hbWVzKVxyXG5leHBvcnQgY29uc3QgYm9va0FuZENoYXB0ZXJSZWdleEZvck9CU0sgPSAvKFteLDojXSspXFxzKFxcZCspL1xyXG5cclxuLy8gTXVsdGlwbGUgY2hhcHRlcnMsIGZvciBleGFtcGxlIFwiR2VuIDEtM1wiXHJcbmV4cG9ydCBjb25zdCBtdWx0aXBsZUNoYXB0ZXJzID0gLyhcXGQqW15cXGQsOiNdKylcXHMqKFxcZCspXFxzKi1cXHMqKFxcZCspXFxzKiQvXHJcblxyXG4vLyBDYW4gYmUgdXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciBnaXZlbiBuYW1lIG9mIGZpbGUgaXMgZnJvbSBPQlNLIChmb3IgZXhhbXBsZSBHZW4tMDEpXHJcbmV4cG9ydCBjb25zdCBpc09CU0tGaWxlID0gLyhbQS16w4Atxb4wLTkgXSspLShcXGR7MiwzfSkvXHJcblxyXG4vLyBFc2NhcGVzIGdpdmVuIHN0cmluZyBzbyB0aGF0IGl0IGNhbiBiZSBzYWZlbHkgdXNlZCBpbiByZWd1bGFyIGV4cHJlc3Npb25cclxuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZUZvclJlZ2V4KHN0cmluZzogc3RyaW5nKSB7XHJcblx0cmV0dXJuIHN0cmluZy5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpOyAvLyAkJiBtZWFucyB0aGUgd2hvbGUgbWF0Y2hlZCBzdHJpbmdcclxufVxyXG4iXX0=