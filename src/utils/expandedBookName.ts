export default function expandBibleBookName(input: string) {
    // Mapping of abbreviations to full book names
    const bookNames = {
        "gen": "Genesis",
        "exod": "Exodus",
        "lev": "Leviticus",
        "num": "Numbers",
        "deut": "Deuteronomy",
        "josh": "Joshua",
        "judg": "Judges",
        "ruth": "Ruth",
        "1 sam": "1 Samuel",
        "2 sam": "2 Samuel",
        "1 kings": "1 Kings",
        "2 kings": "2 Kings",
        "1 chron": "1 Chronicles",
        "2 chron": "2 Chronicles",
        "ezr": "Ezra",
        "neh": "Nehemiah",
        "esth": "Esther",
        "job": "Job",
        "ps": "Psalms",
        "prov": "Proverbs",
        "eccles": "Ecclesiastes",
        "song": "Song of Solomon",
        "isa": "Isaiah",
        "jer": "Jeremiah",
        "lam": "Lamentations",
        "ezek": "Ezekiel",
        "dan": "Daniel",
        "hos": "Hosea",
        "joel": "Joel",
        "am": "Amos",
        "obad": "Obadiah",
        "jonah": "Jonah",
        "micach": "Micah",
        "nah": "Nahum",
        "hab": "Habakkuk",
        "zeph": "Zephaniah",
        "hag": "Haggai",
        "zech": "Zechariah",
        "mal": "Malachi",
        "matt": "Matthew",
        "mark": "Mark",
        "luke": "Luke",
        "john": "John",
        "acts": "Acts",
        "rom": "Romans",
        "1 cor": "1 Corinthians",
        "2 cor": "2 Corinthians",
        "gal": "Galatians",
        "ephes": "Ephesians",
        "phil": "Philippians",
        "col": "Colossians",
        "1 thess": "1 Thessalonians",
        "2 thess": "2 Thessalonians",
        "1 tim": "1 Timothy",
        "2 tim": "2 Timothy",
        "titus": "Titus",
        "philem": "Philemon",
        "heb": "Hebrews",
        "james": "James",
        "1 pet": "1 Peter",
        "2 pet": "2 Peter",
        "1 john": "1 John",
        "2 john": "2 John",
        "3 john": "3 John",
        "jude": "Jude",
        "rev": "Revelation"
    };

    // Convert the input to lowercase for case-insensitive comparison
    const inputLower = input.toLowerCase();

    // Attempt to match and replace using the full list of abbreviations
    for (const [abbrev, fullName] of Object.entries(bookNames)) {
        // Use a regular expression to match the abbreviation followed by a space or a digit (chapter number)
        const regex = new RegExp("^" + abbrev + "(?=\\s|\\d)", "i");
        if (regex.test(inputLower)) {
            // Replace the matched abbreviation with the full book name
            return input.replace(new RegExp(abbrev, "i"), fullName);
        }
    }

    // If no abbreviation matches, return the original input
    return input;
}