import { describe, it, expect } from "vitest";
import type { PluginSettings } from "../main";
import { buildQuote } from "./quote";
import type { Chapter, VerseSource } from "./verse-source";

// Only the knobs buildQuote reads; the rest of PluginSettings is irrelevant to the pure builder.
const settings = {
	oneVerseNotation: ":",
	multipleVersesNotation: ":",
	useInvisibleLinks: true,
	quoteCallout: "[!quote]",
	verseNumberStyle: "superscript",
	showOmissionEllipsis: true,
	showChapterJumpMarker: true,
	insertPartialOnUnresolved: false,
} as PluginSettings;

// A fake VerseSource holding known chapters, so the builder is tested without Obsidian.
function fakeSource(chapters: Record<string, Chapter>): VerseSource {
	return {
		async getChapter(book, chapter) {
			const found = chapters[`${book} ${chapter}`];
			if (!found) throw new Error("not found");
			return found;
		},
	};
}

const gen1: Chapter = {
	fileName: "Gen 1",
	verses: [
		{ number: 1, text: "In the beginning", anchor: "1" },
		{ number: 2, text: "Now the earth", anchor: "2" },
		{ number: 3, text: "And God said", anchor: "3" },
	],
};

describe("buildQuote — single-chapter callout", () => {
	it("renders a [!quote] callout: full-book-name title link, flowing superscript body, trailing invisible links", async () => {
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } }];
		const out = await buildQuote(ref, fakeSource({ "Gen 1": gen1 }), settings, "");
		expect(out).toBe(
			"> [!quote] [[Gen 1#1|Genesis 1:1-3]]\n" +
				"> ¹In the beginning ²Now the earth ³And God said\n" +
				"> [[Gen 1#2|]][[Gen 1#3|]]"
		);
	});

	it("uses the one-verse notation and adds no invisible links for a single verse", async () => {
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 1 } }];
		const out = await buildQuote(ref, fakeSource({ "Gen 1": gen1 }), settings, "");
		expect(out).toBe(
			"> [!quote] [[Gen 1#1|Genesis 1:1]]\n" + "> ¹In the beginning"
		);
	});

	it("expands a multi-word numbered book and links the resolved chapter file name", async () => {
		const oneCor13: Chapter = {
			fileName: "1 Cor 13",
			verses: [
				{ number: 1, text: "If I speak", anchor: "1" },
				{ number: 2, text: "and have not love", anchor: "2" },
				{ number: 3, text: "I gain nothing", anchor: "3" },
				{ number: 4, text: "Love is patient", anchor: "4" },
				{ number: 5, text: "it does not envy", anchor: "5" },
			],
		};
		const ref = [{ book: "1 Cor", chapter: 13, range: { startVerse: 4, endVerse: 5 } }];
		const out = await buildQuote(ref, fakeSource({ "1 Cor 13": oneCor13 }), settings, "");
		expect(out).toBe(
			"> [!quote] [[1 Cor 13#4|1 Corinthians 13:4-5]]\n" +
				"> ⁴Love is patient ⁵it does not envy\n" +
				"> [[1 Cor 13#5|]]"
		);
	});

	it("omits the invisible links line when useInvisibleLinks is off", async () => {
		const noInvisible = { ...settings, useInvisibleLinks: false } as PluginSettings;
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } }];
		const out = await buildQuote(ref, fakeSource({ "Gen 1": gen1 }), noInvisible, "");
		expect(out).toBe(
			"> [!quote] [[Gen 1#1|Genesis 1:1-3]]\n" +
				"> ¹In the beginning ²Now the earth ³And God said"
		);
	});

	it("flows a multi-line verse into prose, joining its lines with a space", async () => {
		const ps23: Chapter = {
			fileName: "Ps 23",
			verses: [{ number: 1, text: "The Lord is my shepherd\nI shall not want", anchor: "1" }],
		};
		const ref = [{ book: "Ps", chapter: 23, range: { startVerse: 1, endVerse: 1 } }];
		const out = await buildQuote(ref, fakeSource({ "Ps 23": ps23 }), settings, "");
		expect(out).toBe(
			"> [!quote] [[Ps 23#1|Psalms 23:1]]\n" + "> ¹The Lord is my shepherd I shall not want"
		);
	});

	it("clamps an end verse past the chapter to the last available verse", async () => {
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 5 } }];
		const out = await buildQuote(ref, fakeSource({ "Gen 1": gen1 }), settings, "");
		expect(out).toBe(
			"> [!quote] [[Gen 1#1|Genesis 1:1-3]]\n" +
				"> ¹In the beginning ²Now the earth ³And God said\n" +
				"> [[Gen 1#2|]][[Gen 1#3|]]"
		);
	});

	it("renders non-contiguous same-chapter chunks as one quote: ellipsis gap, a link per chunk", async () => {
		const gen1full: Chapter = {
			fileName: "Gen 1",
			verses: Array.from({ length: 12 }, (_, i) => ({
				number: i + 1,
				text: `v${i + 1}`,
				anchor: `${i + 1}`,
			})),
		};
		const ref = [
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } },
			{ book: "Gen", chapter: 1, range: { startVerse: 10, endVerse: 12 } },
		];
		const out = await buildQuote(ref, fakeSource({ "Gen 1": gen1full }), settings, "");
		expect(out).toBe(
			"> [!quote] [[Gen 1#1|Genesis 1:1-3]], [[Gen 1#10|10-12]]\n" +
				"> ¹v1 ²v2 ³v3 … ¹⁰v10 ¹¹v11 ¹²v12\n" +
				"> [[Gen 1#2|]][[Gen 1#3|]][[Gen 1#11|]][[Gen 1#12|]]"
		);
	});

	it("reads a cross-chapter range across both chapters, marking the jump with a bold C:V", async () => {
		const gen1full: Chapter = {
			fileName: "Gen 1",
			verses: Array.from({ length: 31 }, (_, i) => ({
				number: i + 1,
				text: `v${i + 1}`,
				anchor: `${i + 1}`,
			})),
		};
		const gen2: Chapter = {
			fileName: "Gen 2",
			verses: Array.from({ length: 3 }, (_, i) => ({
				number: i + 1,
				text: `c2v${i + 1}`,
				anchor: `${i + 1}`,
			})),
		};
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 27, endChapter: 2, endVerse: 2 } }];
		const out = await buildQuote(
			ref,
			fakeSource({ "Gen 1": gen1full, "Gen 2": gen2 }),
			settings,
			""
		);
		expect(out).toBe(
			"> [!quote] [[Gen 1#27|Genesis 1:27-2:2]]\n" +
				"> ²⁷v27 ²⁸v28 ²⁹v29 ³⁰v30 ³¹v31 **2:1**c2v1 ²c2v2\n" +
				"> [[Gen 1#28|]][[Gen 1#29|]][[Gen 1#30|]][[Gen 1#31|]][[Gen 2#1|]][[Gen 2#2|]]"
		);
	});

	it("clamps a cross-chapter end past the end chapter's last verse to its last verse", async () => {
		const gen1full: Chapter = {
			fileName: "Gen 1",
			verses: Array.from({ length: 31 }, (_, i) => ({
				number: i + 1,
				text: `v${i + 1}`,
				anchor: `${i + 1}`,
			})),
		};
		const gen2: Chapter = {
			fileName: "Gen 2",
			verses: Array.from({ length: 3 }, (_, i) => ({
				number: i + 1,
				text: `c2v${i + 1}`,
				anchor: `${i + 1}`,
			})),
		};
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 30, endChapter: 2, endVerse: 9 } }];
		const out = await buildQuote(
			ref,
			fakeSource({ "Gen 1": gen1full, "Gen 2": gen2 }),
			settings,
			""
		);
		expect(out).toBe(
			"> [!quote] [[Gen 1#30|Genesis 1:30-2:3]]\n" +
				"> ³⁰v30 ³¹v31 **2:1**c2v1 ²c2v2 ³c2v3\n" +
				"> [[Gen 1#31|]][[Gen 2#1|]][[Gen 2#2|]][[Gen 2#3|]]"
		);
	});

	it("breaks to a new line and restates the book at a book jump, with the full name in the title", async () => {
		const john3: Chapter = {
			fileName: "John 3",
			verses: Array.from({ length: 16 }, (_, i) => ({
				number: i + 1,
				text: `j${i + 1}`,
				anchor: `${i + 1}`,
			})),
		};
		const rom5: Chapter = {
			fileName: "Rom 5",
			verses: Array.from({ length: 8 }, (_, i) => ({
				number: i + 1,
				text: `r${i + 1}`,
				anchor: `${i + 1}`,
			})),
		};
		const ref = [
			{ book: "John", chapter: 3, range: { startVerse: 16, endVerse: 16 } },
			{ book: "Rom", chapter: 5, range: { startVerse: 8, endVerse: 8 } },
		];
		const out = await buildQuote(ref, fakeSource({ "John 3": john3, "Rom 5": rom5 }), settings, "");
		expect(out).toBe(
			"> [!quote] [[John 3#16|John 3:16]], [[Rom 5#8|Romans 5:8]]\n" +
				"> ¹⁶j16\n" +
				">\n" +
				"> **Romans 5** ⁸r8"
		);
	});

	it("renders the fully-mixed reference: chunks, a same-book chapter switch, ellipsis and bold C:V", async () => {
		const gen1full: Chapter = {
			fileName: "Gen 1",
			verses: Array.from({ length: 12 }, (_, i) => ({
				number: i + 1,
				text: `v${i + 1}`,
				anchor: `${i + 1}`,
			})),
		};
		const gen3: Chapter = {
			fileName: "Gen 3",
			verses: Array.from({ length: 15 }, (_, i) => ({
				number: i + 1,
				text: `c3v${i + 1}`,
				anchor: `${i + 1}`,
			})),
		};
		const ref = [
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } },
			{ book: "Gen", chapter: 1, range: { startVerse: 10, endVerse: 12 } },
			{ book: "Gen", chapter: 3, range: { startVerse: 15, endVerse: 15 } },
		];
		const out = await buildQuote(ref, fakeSource({ "Gen 1": gen1full, "Gen 3": gen3 }), settings, "");
		expect(out).toBe(
			"> [!quote] [[Gen 1#1|Genesis 1:1-3]], [[Gen 1#10|10-12]], [[Gen 3#15|3:15]]\n" +
				"> ¹v1 ²v2 ³v3 … ¹⁰v10 ¹¹v11 ¹²v12\n" +
				"> **3:15**c3v15\n" +
				"> [[Gen 1#2|]][[Gen 1#3|]][[Gen 1#11|]][[Gen 1#12|]]"
		);
	});

	it("aborts by throwing an error naming the segment when the chapter cannot be resolved", async () => {
		const ref = [{ book: "Gen", chapter: 99, range: { startVerse: 1, endVerse: 3 } }];
		await expect(buildQuote(ref, fakeSource({ "Gen 1": gen1 }), settings, "")).rejects.toThrow(
			/Genesis 99/
		);
	});
});

describe("buildQuote — configurable callout wrapper", () => {
	it("uses a custom callout wrapper in place of [!quote]", async () => {
		const custom = { ...settings, quoteCallout: "[!note]" } as PluginSettings;
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 1 } }];
		const out = await buildQuote(ref, fakeSource({ "Gen 1": gen1 }), custom, "");
		expect(out).toBe("> [!note] [[Gen 1#1|Genesis 1:1]]\n> ¹In the beginning");
	});

	it("drops the callout token when the wrapper is empty, keeping the quote lines", async () => {
		const none = { ...settings, quoteCallout: "" } as PluginSettings;
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 1 } }];
		const out = await buildQuote(ref, fakeSource({ "Gen 1": gen1 }), none, "");
		expect(out).toBe("> [[Gen 1#1|Genesis 1:1]]\n> ¹In the beginning");
	});
});

describe("buildQuote — omission ellipsis toggle", () => {
	const gen1full: Chapter = {
		fileName: "Gen 1",
		verses: Array.from({ length: 12 }, (_, i) => ({ number: i + 1, text: `v${i + 1}`, anchor: `${i + 1}` })),
	};

	it("joins non-contiguous same-chapter chunks with a plain space when the ellipsis is off", async () => {
		const off = { ...settings, showOmissionEllipsis: false } as PluginSettings;
		const ref = [
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } },
			{ book: "Gen", chapter: 1, range: { startVerse: 10, endVerse: 12 } },
		];
		const out = await buildQuote(ref, fakeSource({ "Gen 1": gen1full }), off, "");
		expect(out).toBe(
			"> [!quote] [[Gen 1#1|Genesis 1:1-3]], [[Gen 1#10|10-12]]\n" +
				"> ¹v1 ²v2 ³v3 ¹⁰v10 ¹¹v11 ¹²v12\n" +
				"> [[Gen 1#2|]][[Gen 1#3|]][[Gen 1#11|]][[Gen 1#12|]]"
		);
	});
});

describe("buildQuote — chapter-jump marker toggle", () => {
	const gen1full: Chapter = {
		fileName: "Gen 1",
		verses: Array.from({ length: 31 }, (_, i) => ({ number: i + 1, text: `v${i + 1}`, anchor: `${i + 1}` })),
	};
	const gen2: Chapter = {
		fileName: "Gen 2",
		verses: Array.from({ length: 3 }, (_, i) => ({ number: i + 1, text: `c2v${i + 1}`, anchor: `${i + 1}` })),
	};

	it("marks a cross-chapter jump with a plain verse number when the marker is off", async () => {
		const off = { ...settings, showChapterJumpMarker: false } as PluginSettings;
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 27, endChapter: 2, endVerse: 2 } }];
		const out = await buildQuote(ref, fakeSource({ "Gen 1": gen1full, "Gen 2": gen2 }), off, "");
		expect(out).toBe(
			"> [!quote] [[Gen 1#27|Genesis 1:27-2:2]]\n" +
				"> ²⁷v27 ²⁸v28 ²⁹v29 ³⁰v30 ³¹v31 ¹c2v1 ²c2v2\n" +
				"> [[Gen 1#28|]][[Gen 1#29|]][[Gen 1#30|]][[Gen 1#31|]][[Gen 2#1|]][[Gen 2#2|]]"
		);
	});

	it("marks a same-book chapter switch with a plain verse number when the marker is off", async () => {
		const gen3: Chapter = {
			fileName: "Gen 3",
			verses: Array.from({ length: 15 }, (_, i) => ({ number: i + 1, text: `c3v${i + 1}`, anchor: `${i + 1}` })),
		};
		const off = { ...settings, showChapterJumpMarker: false } as PluginSettings;
		const ref = [
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 1 } },
			{ book: "Gen", chapter: 3, range: { startVerse: 15, endVerse: 15 } },
		];
		const out = await buildQuote(ref, fakeSource({ "Gen 1": gen1full, "Gen 3": gen3 }), off, "");
		expect(out).toBe(
			"> [!quote] [[Gen 1#1|Genesis 1:1]], [[Gen 3#15|3:15]]\n" +
				"> ¹v1\n" +
				"> ¹⁵c3v15"
		);
	});
});

describe("buildQuote — abort vs partial on an unresolved segment", () => {
	it("inserts the resolved segments and flags the missing one in partial mode", async () => {
		const partial = { ...settings, insertPartialOnUnresolved: true } as PluginSettings;
		const ref = [
			{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } },
			{ book: "Gen", chapter: 99, range: { startVerse: 1, endVerse: 1 } },
		];
		const out = await buildQuote(ref, fakeSource({ "Gen 1": gen1 }), partial, "");
		expect(out).toBe(
			"> [!quote] [[Gen 1#1|Genesis 1:1-3]]\n" +
				"> ¹In the beginning ²Now the earth ³And God said\n" +
				"> **Could not find Genesis 99**\n" +
				"> [[Gen 1#2|]][[Gen 1#3|]]"
		);
	});
});

describe("buildQuote — verse-number style", () => {
	it("renders plain arabic verse numbers when the style is plain", async () => {
		const plain = { ...settings, verseNumberStyle: "plain" } as PluginSettings;
		const ref = [{ book: "Gen", chapter: 1, range: { startVerse: 1, endVerse: 3 } }];
		const out = await buildQuote(ref, fakeSource({ "Gen 1": gen1 }), plain, "");
		expect(out).toBe(
			"> [!quote] [[Gen 1#1|Genesis 1:1-3]]\n" +
				"> 1In the beginning 2Now the earth 3And God said\n" +
				"> [[Gen 1#2|]][[Gen 1#3|]]"
		);
	});
});
