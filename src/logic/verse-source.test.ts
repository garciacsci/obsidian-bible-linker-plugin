import { describe, it, expect } from "vitest";
import {
	extractChapterVerses,
	extractSectionStarts,
	sectionEndVerse,
	Chapter,
	HeadingInfo,
} from "./verse-source";

// A small chapter file: a level-1 chapter title followed by level-6 verse headings,
// each verse heading on its own line with its text on the lines beneath it.
//
//   line 0: # Genesis 1        <- chapter title (not a verse)
//   line 1: ###### 1
//   line 2: In the beginning
//   line 3: ###### 2
//   line 4: And the earth was without form
function chapter(): { lines: string[]; headings: HeadingInfo[] } {
	const lines = [
		"# Genesis 1",
		"###### 1",
		"In the beginning",
		"###### 2",
		"And the earth was without form",
	];
	const headings: HeadingInfo[] = [
		{ heading: "Genesis 1", level: 1, line: 0 },
		{ heading: "1", level: 6, line: 1 },
		{ heading: "2", level: 6, line: 3 },
	];
	return { lines, headings };
}

describe("extractChapterVerses — verse extraction", () => {
	it("maps each verse heading after the chapter title to a numbered verse", () => {
		const { lines, headings } = chapter();
		expect(
			extractChapterVerses(lines, headings, { verseHeadingLevel: 0, verseOffset: 0 })
		).toEqual([
			{ number: 1, text: "In the beginning", anchor: "1" },
			{ number: 2, text: "And the earth was without form", anchor: "2" },
		]);
	});

	it("joins a multi-line verse with newlines, leaving formatting to the caller", () => {
		const lines = ["# Ps 1", "###### 1", "Blessed is the man", "who walks not"];
		const headings: HeadingInfo[] = [
			{ heading: "Ps 1", level: 1, line: 0 },
			{ heading: "1", level: 6, line: 1 },
		];
		expect(
			extractChapterVerses(lines, headings, { verseHeadingLevel: 0, verseOffset: 0 })[0].text
		).toBe("Blessed is the man\nwho walks not");
	});

	it("stops a verse at a blank line and skips leading blank lines", () => {
		const lines = ["# Ps 1", "###### 1", "", "Blessed", "", "ignored tail"];
		const headings: HeadingInfo[] = [
			{ heading: "Ps 1", level: 1, line: 0 },
			{ heading: "1", level: 6, line: 1 },
		];
		expect(
			extractChapterVerses(lines, headings, { verseHeadingLevel: 0, verseOffset: 0 })[0].text
		).toBe("Blessed");
	});

	it("ignores headings that are not at the verse heading level", () => {
		// With verseHeadingLevel set, both the level-1 chapter title and a stray level-2 section
		// heading drop out, leaving only the verse headings — so verseOffset is -1 to make verse 1
		// land on the first surviving heading.
		const lines = ["# Gen 1", "###### 1", "verse one", "## Section", "###### 2", "verse two"];
		const headings: HeadingInfo[] = [
			{ heading: "Gen 1", level: 1, line: 0 },
			{ heading: "1", level: 6, line: 1 },
			{ heading: "Section", level: 2, line: 3 },
			{ heading: "2", level: 6, line: 4 },
		];
		expect(
			extractChapterVerses(lines, headings, { verseHeadingLevel: 6, verseOffset: -1 })
		).toEqual([
			{ number: 1, text: "verse one", anchor: "1" },
			{ number: 2, text: "verse two", anchor: "2" },
		]);
	});

	it("shifts the verse-to-heading mapping by verseOffset", () => {
		// Two non-verse headings precede the first verse, so verse 1 lives at heading index 2.
		const lines = ["# Gen 1", "## Intro", "###### 1", "verse one"];
		const headings: HeadingInfo[] = [
			{ heading: "Gen 1", level: 1, line: 0 },
			{ heading: "Intro", level: 2, line: 1 },
			{ heading: "1", level: 6, line: 2 },
		];
		expect(
			extractChapterVerses(lines, headings, { verseHeadingLevel: 0, verseOffset: 1 })
		).toEqual([{ number: 1, text: "verse one", anchor: "1" }]);
	});

	it("preserves the verse anchor verbatim", () => {
		const lines = ["# Gen 1", "###### 1a", "split verse"];
		const headings: HeadingInfo[] = [
			{ heading: "Gen 1", level: 1, line: 0 },
			{ heading: "1a", level: 6, line: 1 },
		];
		expect(
			extractChapterVerses(lines, headings, { verseHeadingLevel: 0, verseOffset: 0 })[0].anchor
		).toBe("1a");
	});

	it("yields no verses when only the chapter title is present", () => {
		const lines = ["# Gen 1"];
		const headings: HeadingInfo[] = [{ heading: "Gen 1", level: 1, line: 0 }];
		expect(
			extractChapterVerses(lines, headings, { verseHeadingLevel: 0, verseOffset: 0 })
		).toEqual([]);
	});

	it("yields empty text for a verse heading on the file's last line", () => {
		const lines = ["# Gen 1", "###### 1"];
		const headings: HeadingInfo[] = [
			{ heading: "Gen 1", level: 1, line: 0 },
			{ heading: "1", level: 6, line: 1 },
		];
		expect(
			extractChapterVerses(lines, headings, { verseHeadingLevel: 0, verseOffset: 0 })[0].text
		).toBe("");
	});
});

describe("extractSectionStarts — section boundaries", () => {
	// A chapter with a section title before verse 1 and another before verse 3, mirroring the
	// generated files: level-1 chapter title, level-2 section headings, level-6 verse headings.
	const headings: HeadingInfo[] = [
		{ heading: "Gen 1", level: 1, line: 0 },
		{ heading: "The Creation", level: 2, line: 1 },
		{ heading: "1", level: 6, line: 2 },
		{ heading: "2", level: 6, line: 3 },
		{ heading: "The Expanse", level: 2, line: 4 },
		{ heading: "3", level: 6, line: 5 },
	];

	it("reports the verse number each section heading introduces", () => {
		expect(
			extractSectionStarts(headings, {
				verseHeadingLevel: 6,
				verseOffset: -1,
				sectionHeadingLevel: 2,
			})
		).toEqual([1, 3]);
	});

	it("returns no boundaries when no section heading level is configured", () => {
		expect(
			extractSectionStarts(headings, { verseHeadingLevel: 6, verseOffset: -1 })
		).toEqual([]);
	});
});

describe("sectionEndVerse — end of the section containing a verse", () => {
	const chapter: Chapter = {
		fileName: "Gen 1",
		verses: Array.from({ length: 5 }, (_, i) => ({ number: i + 1, text: "", anchor: `${i + 1}` })),
		sectionStarts: [1, 3],
	};

	it("stops at the verse before the next section", () => {
		expect(sectionEndVerse(chapter, 1)).toBe(2);
	});

	it("runs to the chapter's last verse when no later section follows", () => {
		expect(sectionEndVerse(chapter, 3)).toBe(5);
	});

	it("falls back to the chapter end when the chapter has no marked sections", () => {
		expect(sectionEndVerse({ ...chapter, sectionStarts: [] }, 2)).toBe(5);
	});
});
