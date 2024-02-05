export default function expandBibleBookName(input) {
    // Mapping of abbreviations to full book names
    const bookNames = {
        "gen": "Genesis",
        "ex": "Exodus",
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
        "ezra": "Ezra",
        "neh": "Nehemiah",
        "est": "Esther",
        "job": "Job",
        "ps": "Psalms",
        "prov": "Proverbs",
        "eccl": "Ecclesiastes",
        "song": "Song of Solomon",
        "isa": "Isaiah",
        "jer": "Jeremiah",
        "lam": "Lamentations",
        "ezek": "Ezekiel",
        "dan": "Daniel",
        "hos": "Hosea",
        "joel": "Joel",
        "amos": "Amos",
        "obad": "Obadiah",
        "jonah": "Jonah",
        "mic": "Micah",
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
        "eph": "Ephesians",
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
    for (const [abbrev, fullName] of Object.entries(bookNames)) {
        if (inputLower.startsWith(abbrev)) {
            // Extract the part of the input that matched the abbreviation
            const matchLength = abbrev.length;
            // Reconstruct the input with the full book name, preserving the original case for the rest of the input
            return fullName + input.slice(matchLength);
        }
    }
    // If no abbreviation matches, return the original input
    return input;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5kZWRCb29rTmFtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImV4cGFuZGVkQm9va05hbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE9BQU8sVUFBVSxtQkFBbUIsQ0FBQyxLQUFhO0lBQ3JELDhDQUE4QztJQUM5QyxNQUFNLFNBQVMsR0FBRztRQUNkLEtBQUssRUFBRSxTQUFTO1FBQ2hCLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLFdBQVc7UUFDbEIsS0FBSyxFQUFFLFNBQVM7UUFDaEIsTUFBTSxFQUFFLGFBQWE7UUFDckIsTUFBTSxFQUFFLFFBQVE7UUFDaEIsTUFBTSxFQUFFLFFBQVE7UUFDaEIsTUFBTSxFQUFFLE1BQU07UUFDZCxPQUFPLEVBQUUsVUFBVTtRQUNuQixPQUFPLEVBQUUsVUFBVTtRQUNuQixTQUFTLEVBQUUsU0FBUztRQUNwQixTQUFTLEVBQUUsU0FBUztRQUNwQixTQUFTLEVBQUUsY0FBYztRQUN6QixTQUFTLEVBQUUsY0FBYztRQUN6QixNQUFNLEVBQUUsTUFBTTtRQUNkLEtBQUssRUFBRSxVQUFVO1FBQ2pCLEtBQUssRUFBRSxRQUFRO1FBQ2YsS0FBSyxFQUFFLEtBQUs7UUFDWixJQUFJLEVBQUUsUUFBUTtRQUNkLE1BQU0sRUFBRSxVQUFVO1FBQ2xCLE1BQU0sRUFBRSxjQUFjO1FBQ3RCLE1BQU0sRUFBRSxpQkFBaUI7UUFDekIsS0FBSyxFQUFFLFFBQVE7UUFDZixLQUFLLEVBQUUsVUFBVTtRQUNqQixLQUFLLEVBQUUsY0FBYztRQUNyQixNQUFNLEVBQUUsU0FBUztRQUNqQixLQUFLLEVBQUUsUUFBUTtRQUNmLEtBQUssRUFBRSxPQUFPO1FBQ2QsTUFBTSxFQUFFLE1BQU07UUFDZCxNQUFNLEVBQUUsTUFBTTtRQUNkLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLEtBQUssRUFBRSxPQUFPO1FBQ2QsS0FBSyxFQUFFLE9BQU87UUFDZCxLQUFLLEVBQUUsVUFBVTtRQUNqQixNQUFNLEVBQUUsV0FBVztRQUNuQixLQUFLLEVBQUUsUUFBUTtRQUNmLE1BQU0sRUFBRSxXQUFXO1FBQ25CLEtBQUssRUFBRSxTQUFTO1FBQ2hCLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLE1BQU0sRUFBRSxNQUFNO1FBQ2QsTUFBTSxFQUFFLE1BQU07UUFDZCxNQUFNLEVBQUUsTUFBTTtRQUNkLE1BQU0sRUFBRSxNQUFNO1FBQ2QsS0FBSyxFQUFFLFFBQVE7UUFDZixPQUFPLEVBQUUsZUFBZTtRQUN4QixPQUFPLEVBQUUsZUFBZTtRQUN4QixLQUFLLEVBQUUsV0FBVztRQUNsQixLQUFLLEVBQUUsV0FBVztRQUNsQixNQUFNLEVBQUUsYUFBYTtRQUNyQixLQUFLLEVBQUUsWUFBWTtRQUNuQixTQUFTLEVBQUUsaUJBQWlCO1FBQzVCLFNBQVMsRUFBRSxpQkFBaUI7UUFDNUIsT0FBTyxFQUFFLFdBQVc7UUFDcEIsT0FBTyxFQUFFLFdBQVc7UUFDcEIsT0FBTyxFQUFFLE9BQU87UUFDaEIsUUFBUSxFQUFFLFVBQVU7UUFDcEIsS0FBSyxFQUFFLFNBQVM7UUFDaEIsT0FBTyxFQUFFLE9BQU87UUFDaEIsT0FBTyxFQUFFLFNBQVM7UUFDbEIsT0FBTyxFQUFFLFNBQVM7UUFDbEIsUUFBUSxFQUFFLFFBQVE7UUFDbEIsUUFBUSxFQUFFLFFBQVE7UUFDbEIsUUFBUSxFQUFFLFFBQVE7UUFDbEIsTUFBTSxFQUFFLE1BQU07UUFDZCxLQUFLLEVBQUUsWUFBWTtLQUN0QixDQUFDO0lBRUYsaUVBQWlFO0lBQ2pFLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUV2QyxLQUFLLE1BQU0sQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUN4RCxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDL0IsOERBQThEO1lBQzlELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDbEMsd0dBQXdHO1lBQ3hHLE9BQU8sUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDOUM7S0FDSjtJQUVELHdEQUF3RDtJQUN4RCxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZXhwYW5kQmlibGVCb29rTmFtZShpbnB1dDogc3RyaW5nKSB7XG4gICAgLy8gTWFwcGluZyBvZiBhYmJyZXZpYXRpb25zIHRvIGZ1bGwgYm9vayBuYW1lc1xuICAgIGNvbnN0IGJvb2tOYW1lcyA9IHtcbiAgICAgICAgXCJnZW5cIjogXCJHZW5lc2lzXCIsXG4gICAgICAgIFwiZXhcIjogXCJFeG9kdXNcIixcbiAgICAgICAgXCJsZXZcIjogXCJMZXZpdGljdXNcIixcbiAgICAgICAgXCJudW1cIjogXCJOdW1iZXJzXCIsXG4gICAgICAgIFwiZGV1dFwiOiBcIkRldXRlcm9ub215XCIsXG4gICAgICAgIFwiam9zaFwiOiBcIkpvc2h1YVwiLFxuICAgICAgICBcImp1ZGdcIjogXCJKdWRnZXNcIixcbiAgICAgICAgXCJydXRoXCI6IFwiUnV0aFwiLFxuICAgICAgICBcIjEgc2FtXCI6IFwiMSBTYW11ZWxcIixcbiAgICAgICAgXCIyIHNhbVwiOiBcIjIgU2FtdWVsXCIsXG4gICAgICAgIFwiMSBraW5nc1wiOiBcIjEgS2luZ3NcIixcbiAgICAgICAgXCIyIGtpbmdzXCI6IFwiMiBLaW5nc1wiLFxuICAgICAgICBcIjEgY2hyb25cIjogXCIxIENocm9uaWNsZXNcIixcbiAgICAgICAgXCIyIGNocm9uXCI6IFwiMiBDaHJvbmljbGVzXCIsXG4gICAgICAgIFwiZXpyYVwiOiBcIkV6cmFcIixcbiAgICAgICAgXCJuZWhcIjogXCJOZWhlbWlhaFwiLFxuICAgICAgICBcImVzdFwiOiBcIkVzdGhlclwiLFxuICAgICAgICBcImpvYlwiOiBcIkpvYlwiLFxuICAgICAgICBcInBzXCI6IFwiUHNhbG1zXCIsXG4gICAgICAgIFwicHJvdlwiOiBcIlByb3ZlcmJzXCIsXG4gICAgICAgIFwiZWNjbFwiOiBcIkVjY2xlc2lhc3Rlc1wiLFxuICAgICAgICBcInNvbmdcIjogXCJTb25nIG9mIFNvbG9tb25cIixcbiAgICAgICAgXCJpc2FcIjogXCJJc2FpYWhcIixcbiAgICAgICAgXCJqZXJcIjogXCJKZXJlbWlhaFwiLFxuICAgICAgICBcImxhbVwiOiBcIkxhbWVudGF0aW9uc1wiLFxuICAgICAgICBcImV6ZWtcIjogXCJFemVraWVsXCIsXG4gICAgICAgIFwiZGFuXCI6IFwiRGFuaWVsXCIsXG4gICAgICAgIFwiaG9zXCI6IFwiSG9zZWFcIixcbiAgICAgICAgXCJqb2VsXCI6IFwiSm9lbFwiLFxuICAgICAgICBcImFtb3NcIjogXCJBbW9zXCIsXG4gICAgICAgIFwib2JhZFwiOiBcIk9iYWRpYWhcIixcbiAgICAgICAgXCJqb25haFwiOiBcIkpvbmFoXCIsXG4gICAgICAgIFwibWljXCI6IFwiTWljYWhcIixcbiAgICAgICAgXCJuYWhcIjogXCJOYWh1bVwiLFxuICAgICAgICBcImhhYlwiOiBcIkhhYmFra3VrXCIsXG4gICAgICAgIFwiemVwaFwiOiBcIlplcGhhbmlhaFwiLFxuICAgICAgICBcImhhZ1wiOiBcIkhhZ2dhaVwiLFxuICAgICAgICBcInplY2hcIjogXCJaZWNoYXJpYWhcIixcbiAgICAgICAgXCJtYWxcIjogXCJNYWxhY2hpXCIsXG4gICAgICAgIFwibWF0dFwiOiBcIk1hdHRoZXdcIixcbiAgICAgICAgXCJtYXJrXCI6IFwiTWFya1wiLFxuICAgICAgICBcImx1a2VcIjogXCJMdWtlXCIsXG4gICAgICAgIFwiam9oblwiOiBcIkpvaG5cIixcbiAgICAgICAgXCJhY3RzXCI6IFwiQWN0c1wiLFxuICAgICAgICBcInJvbVwiOiBcIlJvbWFuc1wiLFxuICAgICAgICBcIjEgY29yXCI6IFwiMSBDb3JpbnRoaWFuc1wiLFxuICAgICAgICBcIjIgY29yXCI6IFwiMiBDb3JpbnRoaWFuc1wiLFxuICAgICAgICBcImdhbFwiOiBcIkdhbGF0aWFuc1wiLFxuICAgICAgICBcImVwaFwiOiBcIkVwaGVzaWFuc1wiLFxuICAgICAgICBcInBoaWxcIjogXCJQaGlsaXBwaWFuc1wiLFxuICAgICAgICBcImNvbFwiOiBcIkNvbG9zc2lhbnNcIixcbiAgICAgICAgXCIxIHRoZXNzXCI6IFwiMSBUaGVzc2Fsb25pYW5zXCIsXG4gICAgICAgIFwiMiB0aGVzc1wiOiBcIjIgVGhlc3NhbG9uaWFuc1wiLFxuICAgICAgICBcIjEgdGltXCI6IFwiMSBUaW1vdGh5XCIsXG4gICAgICAgIFwiMiB0aW1cIjogXCIyIFRpbW90aHlcIixcbiAgICAgICAgXCJ0aXR1c1wiOiBcIlRpdHVzXCIsXG4gICAgICAgIFwicGhpbGVtXCI6IFwiUGhpbGVtb25cIixcbiAgICAgICAgXCJoZWJcIjogXCJIZWJyZXdzXCIsXG4gICAgICAgIFwiamFtZXNcIjogXCJKYW1lc1wiLFxuICAgICAgICBcIjEgcGV0XCI6IFwiMSBQZXRlclwiLFxuICAgICAgICBcIjIgcGV0XCI6IFwiMiBQZXRlclwiLFxuICAgICAgICBcIjEgam9oblwiOiBcIjEgSm9oblwiLFxuICAgICAgICBcIjIgam9oblwiOiBcIjIgSm9oblwiLFxuICAgICAgICBcIjMgam9oblwiOiBcIjMgSm9oblwiLFxuICAgICAgICBcImp1ZGVcIjogXCJKdWRlXCIsXG4gICAgICAgIFwicmV2XCI6IFwiUmV2ZWxhdGlvblwiXG4gICAgfTtcblxuICAgIC8vIENvbnZlcnQgdGhlIGlucHV0IHRvIGxvd2VyY2FzZSBmb3IgY2FzZS1pbnNlbnNpdGl2ZSBjb21wYXJpc29uXG4gICAgY29uc3QgaW5wdXRMb3dlciA9IGlucHV0LnRvTG93ZXJDYXNlKCk7XG5cbiAgICBmb3IgKGNvbnN0IFthYmJyZXYsIGZ1bGxOYW1lXSBvZiBPYmplY3QuZW50cmllcyhib29rTmFtZXMpKSB7XG4gICAgICAgIGlmIChpbnB1dExvd2VyLnN0YXJ0c1dpdGgoYWJicmV2KSkge1xuICAgICAgICAgICAgLy8gRXh0cmFjdCB0aGUgcGFydCBvZiB0aGUgaW5wdXQgdGhhdCBtYXRjaGVkIHRoZSBhYmJyZXZpYXRpb25cbiAgICAgICAgICAgIGNvbnN0IG1hdGNoTGVuZ3RoID0gYWJicmV2Lmxlbmd0aDtcbiAgICAgICAgICAgIC8vIFJlY29uc3RydWN0IHRoZSBpbnB1dCB3aXRoIHRoZSBmdWxsIGJvb2sgbmFtZSwgcHJlc2VydmluZyB0aGUgb3JpZ2luYWwgY2FzZSBmb3IgdGhlIHJlc3Qgb2YgdGhlIGlucHV0XG4gICAgICAgICAgICByZXR1cm4gZnVsbE5hbWUgKyBpbnB1dC5zbGljZShtYXRjaExlbmd0aCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiBubyBhYmJyZXZpYXRpb24gbWF0Y2hlcywgcmV0dXJuIHRoZSBvcmlnaW5hbCBpbnB1dFxuICAgIHJldHVybiBpbnB1dDtcbn0iXX0=