import { describe, it, expect } from "vitest";
import type { PluginSettings } from "../main";
import { buildSegmentLabels, buildQuoteTitleLinks, type LabelInput, type TitleSegment } from "./segment-label";

// Only the notation knobs matter to the label rules; the rest of PluginSettings is irrelevant.
const settings = {
	oneVerseNotation: ":",
	multipleVersesNotation: ":",
} as PluginSettings;

// Legacy European notation, to prove the helper honors configurable separators.
const legacy = { oneVerseNotation: ".", multipleVersesNotation: "," } as PluginSettings;

describe("buildSegmentLabels — label rules", () => {
	it("labels a single-verse reference with the one-verse notation", () => {
		const segs: LabelInput[] = [{ book: "Gen", chapter: 1, span: "1" }];
		expect(buildSegmentLabels(segs, true, settings)).toEqual(["Genesis 1:1"]);
	});

	it("labels a multi-verse single segment with the multiple-verses notation", () => {
		const segs: LabelInput[] = [{ book: "Gen", chapter: 1, span: "1-3" }];
		expect(buildSegmentLabels(segs, false, settings)).toEqual(["Genesis 1:1-3"]);
	});

	it("restates only the span for a same-book, same-chapter chunk", () => {
		const segs: LabelInput[] = [
			{ book: "Gen", chapter: 1, span: "1-3" },
			{ book: "Gen", chapter: 1, span: "10-12" },
		];
		expect(buildSegmentLabels(segs, false, settings)).toEqual(["Genesis 1:1-3", "10-12"]);
	});

	it("restates the chapter on a same-book chapter switch", () => {
		const segs: LabelInput[] = [
			{ book: "Heb", chapter: 11, span: "1-3" },
			{ book: "Heb", chapter: 12, span: "1" },
		];
		expect(buildSegmentLabels(segs, false, settings)).toEqual(["Hebrews 11:1-3", "12:1"]);
	});

	it("restates the full book name on a book change", () => {
		const segs: LabelInput[] = [
			{ book: "John", chapter: 3, span: "16" },
			{ book: "Rom", chapter: 5, span: "8" },
		];
		expect(buildSegmentLabels(segs, false, settings)).toEqual(["John 3:16", "Romans 5:8"]);
	});

	it("tracks chapter changes against a cross-chapter segment's end chapter", () => {
		// First segment ends in chapter 2; a following chapter-2 chunk is the same chapter (no restate).
		const segs: LabelInput[] = [
			{ book: "Gen", chapter: 1, endChapter: 2, span: "27-2:2" },
			{ book: "Gen", chapter: 2, span: "5" },
		];
		expect(buildSegmentLabels(segs, false, settings)).toEqual(["Genesis 1:27-2:2", "5"]);
	});

	it("renders the full mixed reference labels", () => {
		const segs: LabelInput[] = [
			{ book: "Rom", chapter: 10, span: "17" },
			{ book: "Heb", chapter: 11, span: "1-3" },
			{ book: "Heb", chapter: 12, span: "1" },
			{ book: "Rom", chapter: 8, span: "28" },
		];
		expect(buildSegmentLabels(segs, false, settings)).toEqual([
			"Romans 10:17",
			"Hebrews 11:1-3",
			"12:1",
			"Romans 8:28",
		]);
	});

	it("honors configurable (legacy European) notation", () => {
		const single: LabelInput[] = [{ book: "Gen", chapter: 1, span: "1" }];
		expect(buildSegmentLabels(single, true, legacy)).toEqual(["Genesis 1.1"]);
		const multi: LabelInput[] = [
			{ book: "Gen", chapter: 1, span: "1-3" },
			{ book: "Gen", chapter: 3, span: "15" },
		];
		expect(buildSegmentLabels(multi, false, legacy)).toEqual(["Genesis 1,1-3", "3,15"]);
	});
});

describe("buildQuoteTitleLinks — labeled wikilinks joined with ', '", () => {
	it("renders each segment as a link to its first verse, joined with ', '", () => {
		const segs: TitleSegment[] = [
			{ book: "Gen", chapter: 1, span: "1-3", fileName: "Gen 1", anchor: "1" },
			{ book: "Gen", chapter: 1, span: "10-12", fileName: "Gen 1", anchor: "10" },
			{ book: "Gen", chapter: 3, span: "15", fileName: "Gen 3", anchor: "15" },
		];
		expect(buildQuoteTitleLinks(segs, false, settings)).toBe(
			"[[Gen 1#1|Genesis 1:1-3]], [[Gen 1#10|10-12]], [[Gen 3#15|3:15]]"
		);
	});
});
