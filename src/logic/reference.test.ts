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

	it("accepts a bare single verse as a following same-chapter chunk", () => {
		expect(parseReference("Gen 1:1,5", settings)).toEqual([
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 1 } },
			{ book: "Gen", chapter: 1, range: { startVerse: 5, endVerse: 5 } },
		]);
	});

	it("throws on malformed input instead of silently mis-parsing", () => {
		expect(() => parseReference("not a reference", settings)).toThrow();
		expect(() => parseReference("Gen 1", settings)).toThrow();
		expect(() => parseReference("", settings)).toThrow();
	});
});
