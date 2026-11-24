import { describe, it, expect } from "vitest";
import {
	extractChapterVerses,
	extractSectionStarts,
	sectionEndVerse,
	splitGluedHeading,
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

// The Bible Gateway export glues a section heading onto the end of the verse before it, with no
// separator and no "## " line: "...eternal life.For God So Loved the World". Made-up text below
// keeps that shape.
describe("splitGluedHeading — section heading glued onto a verse", () => {
	it("strips a heading glued after a full stop, keeping the trailing space", () => {
		expect(splitGluedHeading("and the man went home.The Man Goes Home ")).toEqual({
			text: "and the man went home. ",
			heading: "The Man Goes Home",
		});
	});

	it("strips a heading glued after a closing quote", () => {
		expect(splitGluedHeading('he said, "Go in peace."A Gift for the Prophet ')).toEqual({
			text: 'he said, "Go in peace." ',
			heading: "A Gift for the Prophet",
		});
	});

	it("strips a heading glued after a nested closing quote and the outer quote", () => {
		expect(splitGluedHeading("\"he said, 'Come.' \"The Feast Begins")).toEqual({
			text: "\"he said, 'Come.' \"",
			heading: "The Feast Begins",
		});
	});

	it("strips a heading after spaced nested closing quotes and italic marks", () => {
		expect(splitGluedHeading("says the LORD.\" ' \"The Vision of the Lamp ").text).toBe(
			"says the LORD.\" ' \" "
		);
		expect(splitGluedHeading("I am _He._\"The Second Sign ").text).toBe("I am _He._\" ");
		expect(splitGluedHeading("'Peace _is given._'The People Return ").text).toBe(
			"'Peace _is given._' "
		);
	});

	it("strips a one-word heading and one ending in a question mark", () => {
		expect(splitGluedHeading("grace be with you.Benediction ").text).toBe("grace be with you. ");
		expect(splitGluedHeading("they were afraid.Who Is the Greatest? ").text).toBe("they were afraid. ");
	});

	it("keeps a bracket that opens the next verse", () => {
		expect(splitGluedHeading("a later note.]The Woman at the Well [[ ").text).toBe("a later note.] [[ ");
	});

	it("leaves a verse that ends in a quoted capitalised word", () => {
		for (const text of [
			'and he called the place "Bethel" ',
			'and he named him "Peleg." ',
			'and they cried out, "Hosanna ',
			"in the LORD'S House ",
			'"They are many!" "Silence!" ',
		]) {
			expect(splitGluedHeading(text)).toEqual({ text });
		}
	});

	it("leaves glued text that is not in title case", () => {
		for (const text of [
			"blessed be the man.' \"And all the people shall say, 'Amen!'",
			"let its spices flow.Together in the Garden Let my beloved come",
			"and he was buried.David Rose and went down to the city",
		]) {
			expect(splitGluedHeading(text)).toEqual({ text });
		}
	});
});

describe("glued section headings in a chapter file", () => {
	// Gen 1 as the export writes it: no "## " lines, the section titles glued onto verses 2 and 3.
	const lines = [
		"# Gen 1",
		"###### 1 ",
		"In the beginning. ",
		"",
		"###### 2 ",
		"And it was so.The Second Day ",
		"",
		"###### 3 ",
		"the first line, ",
		"and the second line.The Third Day ",
		"",
		"###### 4 ",
		"And it was good.The Next Chapter ",
	];
	const headings: HeadingInfo[] = [
		{ heading: "Gen 1", level: 1, line: 0 },
		{ heading: "1", level: 6, line: 1 },
		{ heading: "2", level: 6, line: 4 },
		{ heading: "3", level: 6, line: 7 },
		{ heading: "4", level: 6, line: 11 },
	];
	const options = { verseHeadingLevel: 6, verseOffset: -1 };

	it("copies the verse text without the glued heading", () => {
		expect(extractChapterVerses(lines, headings, options).map((verse) => verse.text)).toEqual([
			"In the beginning. ",
			"And it was so. ",
			"the first line, \nand the second line. ",
			"And it was good. ",
		]);
	});

	it("starts a section at the verse after a glued heading, without a section heading level", () => {
		// The heading after the last verse (4) opens the next chapter, so it adds no start here.
		expect(extractSectionStarts(headings, options, lines)).toEqual([3, 4]);
	});

	it("merges glued section starts with section headings", () => {
		const withSection = [...lines, "## Real Section", "###### 5 ", "verse five "];
		const moreHeadings: HeadingInfo[] = [
			...headings,
			{ heading: "Real Section", level: 2, line: 13 },
			{ heading: "5", level: 6, line: 14 },
		];
		expect(
			extractSectionStarts(moreHeadings, { ...options, sectionHeadingLevel: 2 }, withSection)
		).toEqual([3, 4, 5]);
	});

	it("lets \"f\" stop at the verse before the glued heading's section", () => {
		const chapter: Chapter = {
			fileName: "Gen 1",
			verses: extractChapterVerses(lines, headings, options),
			sectionStarts: extractSectionStarts(headings, options, lines),
		};
		expect(sectionEndVerse(chapter, 1)).toBe(2);
	});
});
