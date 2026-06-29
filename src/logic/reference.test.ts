import { describe, it, expect } from "vitest";
import type { PluginSettings } from "../main";
import { parseReference } from "./reference";

// parseReference is pure and Obsidian-free; settings is unused this slice.
const settings = {} as PluginSettings;

describe("parseReference — single-chapter parity", () => {
	it("parses a single verse", () => {
		expect(parseReference("Gen 1:1", settings)).toEqual([
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 1 } },
		]);
	});

	it("parses a single in-chapter range", () => {
		expect(parseReference("Gen 1:1-5", settings)).toEqual([
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 5 } },
		]);
	});

	it("treats the legacy comma form as the colon form (single verse)", () => {
		expect(parseReference("Gen 1,1", settings)).toEqual(
			parseReference("Gen 1:1", settings)
		);
	});

	it("treats the legacy comma form as the colon form (range)", () => {
		expect(parseReference("Gen 1,1-5", settings)).toEqual(
			parseReference("Gen 1:1-5", settings)
		);
	});

	it("accepts a dot between chapter and verse", () => {
		expect(parseReference("Gen 1.1", settings)).toEqual([
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 1 } },
		]);
	});

	it("splits a numbered, multi-word book from its chapter", () => {
		expect(parseReference("1 Cor 13:4-7", settings)).toEqual([
			{ book: "1 Cor", chapter: 13, range: { startVerse: 4, endVerse: 7 } },
		]);
	});

	it("preserves the book as typed (capitalization is the command's job)", () => {
		expect(parseReference("gen 1:1", settings)[0].book).toBe("gen");
	});

	it("splits non-contiguous same-chapter chunks, each inheriting book and chapter", () => {
		expect(parseReference("Gen 1:1-3,10-12", settings)).toEqual([
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } },
			{ book: "Gen", chapter: 1, range: { startVerse: 10, endVerse: 12 } },
		]);
	});

	it("parses a range whose end carries its own chapter (cross-chapter range)", () => {
		expect(parseReference("Gen 1:27-2:2", settings)).toEqual([
			{ book: "Gen", chapter: 1, range: { startVerse: 27, endChapter: 2, endVerse: 2 } },
		]);
	});

	it("accepts a bare single verse as a following same-chapter chunk", () => {
		expect(parseReference("Gen 1:1,5", settings)).toEqual([
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 1 } },
			{ book: "Gen", chapter: 1, range: { startVerse: 5, endVerse: 5 } },
		]);
	});

	it("splits on ; into cross-book segments, the second restating its own book", () => {
		expect(parseReference("John 3:16; Rom 5:8", settings)).toEqual([
			{ book: "John", chapter: 3, range: { startVerse: 16, endVerse: 16 } },
			{ book: "Rom", chapter: 5, range: { startVerse: 8, endVerse: 8 } },
		]);
	});

	it("lets a bookless ; segment keep the book while switching chapter (fully mixed)", () => {
		expect(parseReference("Gen 1:1-3,10-12; 3:15", settings)).toEqual([
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } },
			{ book: "Gen", chapter: 1, range: { startVerse: 10, endVerse: 12 } },
			{ book: "Gen", chapter: 3, range: { startVerse: 15, endVerse: 15 } },
		]);
	});

	it("lets a bookless ; segment carry a verse range without the range hijacking the book", () => {
		// The range's "-" must not be mistaken for a book/chapter divider: "12:1-6" is chapter 12
		// verses 1-6 under the running book, not book "1" chapter "6".
		expect(parseReference("Heb 11:1-3; 12:1-6", settings)).toEqual([
			{ book: "Heb", chapter: 11, range: { startVerse: 1, endVerse: 3 } },
			{ book: "Heb", chapter: 12, range: { startVerse: 1, endVerse: 6 } },
		]);
	});

	it("parses an open-ended 'ff' suffix as a to-chapter-end range", () => {
		expect(parseReference("John 3:16ff", settings)).toEqual([
			{ book: "John", chapter: 3, range: { startVerse: 16, endVerse: 16, toChapterEnd: true } },
		]);
	});

	it("accepts the dashed, spaced, and uppercase 'ff' forms identically", () => {
		const expected = parseReference("John 3:16ff", settings);
		expect(parseReference("John 3:16-ff", settings)).toEqual(expected);
		expect(parseReference("John 3:16 ff", settings)).toEqual(expected);
		expect(parseReference("John 3:16FF", settings)).toEqual(expected);
	});

	it("lets a 'ff' chunk follow other same-chapter chunks", () => {
		expect(parseReference("John 3:1-3,16ff", settings)).toEqual([
			{ book: "John", chapter: 3, range: { startVerse: 1, endVerse: 3 } },
			{ book: "John", chapter: 3, range: { startVerse: 16, endVerse: 16, toChapterEnd: true } },
		]);
	});

	it("rejects the not-yet-supported 'f' (end of section) suffix with a clear message", () => {
		expect(() => parseReference("John 3:16f", settings)).toThrow(/not supported yet/);
	});

	it("throws on malformed input instead of silently mis-parsing", () => {
		expect(() => parseReference("not a reference", settings)).toThrow();
		expect(() => parseReference("Gen 1", settings)).toThrow();
		expect(() => parseReference("", settings)).toThrow();
	});
});

describe("parseReference — configurable chapter↔verse separator", () => {
	const custom = { chapterVerseSeparator: "/" } as PluginSettings;

	it("accepts a configured custom separator between chapter and verse", () => {
		expect(parseReference("Gen 1/1-3", custom)).toEqual([
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } },
		]);
	});

	it("still accepts the legacy comma form regardless of the configured separator", () => {
		expect(parseReference("Gen 1,1", custom)).toEqual([
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 1 } },
		]);
	});

	it("applies the custom separator to a bookless chapter switch too", () => {
		expect(parseReference("Gen 1/1; 3/15", custom)).toEqual([
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 1 } },
			{ book: "Gen", chapter: 3, range: { startVerse: 15, endVerse: 15 } },
		]);
	});
});
