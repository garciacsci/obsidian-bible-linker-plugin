import { describe, it, expect } from "vitest";
import type { PluginSettings } from "../main";
import { buildLinks } from "./link";
import { LinkType } from "./link-type";
import type { Chapter, VerseSource } from "./verse-source";

// Only the knobs buildLinks reads; the rest of PluginSettings is irrelevant to the pure builder.
const settings = {
	linkSeparator: "#",
	versePrefix: "",
	oneVerseNotation: ":",
	multipleVersesNotation: ":",
	shouldCapitalizeBookNames: true,
} as PluginSettings;

// A fake VerseSource holding known chapters, so the builder is tested without Obsidian. Only the
// cross-chapter path consults it; single-chapter references must never reach for verse counts.
function fakeSource(chapters: Record<string, Chapter>): VerseSource {
	return {
		async getChapter(book, chapter) {
			const found = chapters[`${book} ${chapter}`];
			if (!found) throw new Error("not found");
			return found;
		},
	};
}

// A source that fails if touched — proves a single-chapter reference needs no verse counts.
const neverSource = fakeSource({});

describe("buildLinks — single contiguous range (legacy parity)", () => {
	it("emits a Basic link per verse", async () => {
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } }];
		const out = await buildLinks(ref, LinkType.Basic, settings, neverSource, "/");
		expect(out).toEqual(["[[Gen 1#1]]", "[[Gen 1#2]]", "[[Gen 1#3]]"]);
	});

	it("makes every Invisible link's display text empty", async () => {
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } }];
		const out = await buildLinks(ref, LinkType.Invisible, settings, neverSource, "/");
		expect(out).toEqual(["[[Gen 1#1|]]", "[[Gen 1#2|]]", "[[Gen 1#3|]]"]);
	});

	it("prefixes every Embedded link with !", async () => {
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } }];
		const out = await buildLinks(ref, LinkType.Embedded, settings, neverSource, "/");
		expect(out).toEqual(["![[Gen 1#1]]", "![[Gen 1#2]]", "![[Gen 1#3]]"]);
	});

	it("labels FirstAndLast with the full book name on the first verse and -end on the last", async () => {
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } }];
		const out = await buildLinks(ref, LinkType.FirstAndLast, settings, neverSource, "/");
		expect(out).toEqual([
			"[[Gen 1#1|Genesis 1:1]]",
			"[[Gen 1#2|]]",
			"[[Gen 1#3|-3]]",
		]);
	});

	it("labels a single-verse FirstAndLast reference with the one-verse notation", async () => {
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 5, endVerse: 5 } }];
		const out = await buildLinks(ref, LinkType.FirstAndLast, settings, neverSource, "/");
		expect(out).toEqual(["[[Gen 1#5|Genesis 1:5]]"]);
	});

	it("throws on a reversed range (begin verse greater than end verse), as the legacy command did", async () => {
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 5, endVerse: 3 } }];
		await expect(buildLinks(ref, LinkType.Basic, settings, neverSource, "/")).rejects.toBe(
			"Begin verse is bigger than end verse"
		);
	});
});

describe("buildLinks — multi-segment references", () => {
	it("emits a link per verse across non-contiguous same-chapter chunks", async () => {
		const ref = [
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } },
			{ book: "Gen", chapter: 1, range: { startVerse: 10, endVerse: 12 } },
		];
		const out = await buildLinks(ref, LinkType.Basic, settings, neverSource, "/");
		expect(out).toEqual([
			"[[Gen 1#1]]",
			"[[Gen 1#2]]",
			"[[Gen 1#3]]",
			"[[Gen 1#10]]",
			"[[Gen 1#11]]",
			"[[Gen 1#12]]",
		]);
	});

	it("scopes FirstAndLast per chunk so each chunk shows its own first and last", async () => {
		const ref = [
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } },
			{ book: "Gen", chapter: 1, range: { startVerse: 10, endVerse: 12 } },
		];
		const out = await buildLinks(ref, LinkType.FirstAndLast, settings, neverSource, "/");
		expect(out).toEqual([
			"[[Gen 1#1|Genesis 1:1]]",
			"[[Gen 1#2|]]",
			"[[Gen 1#3|-3]]",
			"[[Gen 1#10|Genesis 1:10]]",
			"[[Gen 1#11|]]",
			"[[Gen 1#12|-12]]",
		]);
	});

	it("emits a link per cited verse across a cross-book reference", async () => {
		const ref = [
			{ book: "John", chapter: 3, range: { startVerse: 16, endVerse: 16 } },
			{ book: "Rom", chapter: 5, range: { startVerse: 8, endVerse: 8 } },
		];
		const out = await buildLinks(ref, LinkType.Basic, settings, neverSource, "/");
		expect(out).toEqual(["[[John 3#16]]", "[[Rom 5#8]]"]);
	});

	it("labels each cross-book segment independently under FirstAndLast", async () => {
		const ref = [
			{ book: "John", chapter: 3, range: { startVerse: 16, endVerse: 16 } },
			{ book: "Rom", chapter: 5, range: { startVerse: 8, endVerse: 8 } },
		];
		const out = await buildLinks(ref, LinkType.FirstAndLast, settings, neverSource, "/");
		expect(out).toEqual(["[[John 3#16|John 3:16]]", "[[Rom 5#8|Romans 5:8]]"]);
	});
});

describe("buildLinks — cross-chapter range", () => {
	// A 31-verse Gen 1 and a short Gen 2, so the enumeration must read each chapter's verse count.
	const chapters = {
		"Gen 1": {
			fileName: "Gen 1",
			verses: Array.from({ length: 31 }, (_, i) => ({
				number: i + 1,
				text: `v${i + 1}`,
				anchor: `${i + 1}`,
			})),
		} as Chapter,
		"Gen 2": {
			fileName: "Gen 2",
			verses: Array.from({ length: 3 }, (_, i) => ({
				number: i + 1,
				text: `c2v${i + 1}`,
				anchor: `${i + 1}`,
			})),
		} as Chapter,
	};

	it("enumerates verses across the chapter boundary using the VerseSource verse counts", async () => {
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 27, endChapter: 2, endVerse: 2 } }];
		const out = await buildLinks(ref, LinkType.Basic, settings, fakeSource(chapters), "/");
		expect(out).toEqual([
			"[[Gen 1#27]]",
			"[[Gen 1#28]]",
			"[[Gen 1#29]]",
			"[[Gen 1#30]]",
			"[[Gen 1#31]]",
			"[[Gen 2#1]]",
			"[[Gen 2#2]]",
		]);
	});

	it("clamps a cross-chapter end past the end chapter's last verse", async () => {
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 30, endChapter: 2, endVerse: 9 } }];
		const out = await buildLinks(ref, LinkType.Basic, settings, fakeSource(chapters), "/");
		expect(out).toEqual([
			"[[Gen 1#30]]",
			"[[Gen 1#31]]",
			"[[Gen 2#1]]",
			"[[Gen 2#2]]",
			"[[Gen 2#3]]",
		]);
	});

	it("scopes FirstAndLast across the whole cross-chapter span (first verse to last)", async () => {
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 30, endChapter: 2, endVerse: 2 } }];
		const out = await buildLinks(ref, LinkType.FirstAndLast, settings, fakeSource(chapters), "/");
		expect(out).toEqual([
			"[[Gen 1#30|Genesis 1:30]]",
			"[[Gen 1#31|]]",
			"[[Gen 2#1|]]",
			"[[Gen 2#2|-2]]",
		]);
	});

	it("combines a cross-chapter range with a following cross-book segment", async () => {
		const ref = [
			{ book: "Gen", chapter: 1, range: { startVerse: 30, endChapter: 2, endVerse: 2 } },
			{ book: "John", chapter: 3, range: { startVerse: 16, endVerse: 16 } },
		];
		const out = await buildLinks(ref, LinkType.Basic, settings, fakeSource(chapters), "/");
		expect(out).toEqual([
			"[[Gen 1#30]]",
			"[[Gen 1#31]]",
			"[[Gen 2#1]]",
			"[[Gen 2#2]]",
			"[[John 3#16]]",
		]);
	});
});

describe("buildLinks — Title style", () => {
	// A 31-verse Gen 1 and a short Gen 2 so the cross-chapter path can read each chapter's count.
	const crossChapters = {
		"Gen 1": {
			fileName: "Gen 1",
			verses: Array.from({ length: 31 }, (_, i) => ({ number: i + 1, text: `v${i + 1}`, anchor: `${i + 1}` })),
		} as Chapter,
		"Gen 2": {
			fileName: "Gen 2",
			verses: Array.from({ length: 3 }, (_, i) => ({ number: i + 1, text: `c2v${i + 1}`, anchor: `${i + 1}` })),
		} as Chapter,
	};

	it("labels a single-verse reference with the one-verse notation and no invisible links", async () => {
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 5, endVerse: 5 } }];
		const out = await buildLinks(ref, LinkType.TitleStyle, settings, neverSource, "/");
		expect(out).toEqual(["[[Gen 1#5|Genesis 1:5]]"]);
	});

	it("emits one labeled link per chunk with invisible links for the chunk's other verses", async () => {
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } }];
		const out = await buildLinks(ref, LinkType.TitleStyle, settings, neverSource, "/");
		// Visible label on the first verse; verses 2-3 follow as invisible links (backlink parity).
		expect(out).toEqual(["[[Gen 1#1|Genesis 1:1-3]][[Gen 1#2|]][[Gen 1#3|]]"]);
	});

	it("labels chunks like the Copy-text title across book and chapter changes", async () => {
		// Romans 10:17; Hebrews 11:1-3, 12:1; Romans 8:28
		const ref = [
			{ book: "Rom", chapter: 10, range: { startVerse: 17, endVerse: 17 } },
			{ book: "Heb", chapter: 11, range: { startVerse: 1, endVerse: 3 } },
			{ book: "Heb", chapter: 12, range: { startVerse: 1, endVerse: 1 } },
			{ book: "Rom", chapter: 8, range: { startVerse: 28, endVerse: 28 } },
		];
		const out = await buildLinks(ref, LinkType.TitleStyle, settings, neverSource, "/");
		expect(out).toEqual([
			"[[Rom 10#17|Romans 10:17]]",
			"[[Heb 11#1|Hebrews 11:1-3]][[Heb 11#2|]][[Heb 11#3|]]",
			"[[Heb 12#1|12:1]]",
			"[[Rom 8#28|Romans 8:28]]",
		]);
		// As the command lays them out (newline off), the visible labels read as a sentence:
		expect(out.join(", ")).toBe(
			"[[Rom 10#17|Romans 10:17]], " +
				"[[Heb 11#1|Hebrews 11:1-3]][[Heb 11#2|]][[Heb 11#3|]], " +
				"[[Heb 12#1|12:1]], " +
				"[[Rom 8#28|Romans 8:28]]"
		);
	});

	it("targets and labels a cross-chapter chunk correctly, with invisible links across the boundary", async () => {
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 30, endChapter: 2, endVerse: 2 } }];
		const out = await buildLinks(ref, LinkType.TitleStyle, settings, fakeSource(crossChapters), "/");
		expect(out).toEqual([
			"[[Gen 1#30|Genesis 1:30-2:2]][[Gen 1#31|]][[Gen 2#1|]][[Gen 2#2|]]",
		]);
	});

	it("honors the verse prefix and separator in link targets", async () => {
		const custom = { ...settings, versePrefix: "v", linkSeparator: "#" } as PluginSettings;
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 2 } }];
		const out = await buildLinks(ref, LinkType.TitleStyle, custom, neverSource, "/");
		expect(out).toEqual(["[[Gen 1#v1|Genesis 1:1-2]][[Gen 1#v2|]]"]);
	});
});
