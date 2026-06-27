const superscriptMap: Record<string, string> = {
	"0": "⁰",
	"1": "¹",
	"2": "²",
	"3": "³",
	"4": "⁴",
	"5": "⁵",
	"6": "⁶",
	"7": "⁷",
	"8": "⁸",
	"9": "⁹",
};

/**
 * Capitalizes the first letter of the given string, skipping leading whitespace, digits, and
 * the punctuation that can precede a book name (so "1cor" -> "1Cor"). Pure (Obsidian-free) so
 * both the Obsidian commands and the pure builders can share one definition.
 * @param str String that should be capitalized
 */
export function capitalize(str: string): string {
	str = str.toLocaleLowerCase();
	for (let i = 0; i < str.length; i++) {
		if (/[^\s\d.,#-]/.test(str.charAt(i))) {
			return str.slice(0, i) + str.charAt(i).toUpperCase() + str.slice(i + 1);
		}
	}
	return str;
}

/**
 * Replaces all numbers in the given string with their corresponding unicode superscript version
 */
export function numbersToSuperscript(value: string): string {
	let result = "";
	for (const char of value) {
		result += superscriptMap[char] ?? char;
	}
	return result;
}

