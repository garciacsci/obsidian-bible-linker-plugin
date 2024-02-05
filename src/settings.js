import { __awaiter } from "tslib";
import { Notice, PluginSettingTab, Setting } from "obsidian";
import { LinkType } from "./modals/link-verse-modal";
/**
 * Settings for plugin
 */
export class SettingsTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h1", { text: "Copy and Link Bible verses command" });
        containerEl.createEl("h4", { text: "Functional" });
        new Setting(containerEl)
            .setName("Verse offset")
            .setDesc('Change this if wrong verses are being linked, e.g. you want "Gen 1,1-3" but output is text from verses 2-4 → set this to -1')
            .setClass("important-setting")
            .addText((inputBox) => inputBox
            .setValue(this.plugin.settings.verseOffset.toString())
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            const number = Number.parseInt(value);
            if (value === "-")
                return;
            if (Number.isNaN(number)) {
                new Notice("Invalid input, please insert valid integer");
                inputBox.setValue("");
                return;
            }
            this.plugin.settings.verseOffset = number;
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName("Verse heading level")
            .setDesc('If set, only headings of specified level are considered verses (if first heading of this level is always a verse, also set "Verse offset" to -1)')
            .addDropdown((dropdown) => {
            var _a, _b;
            dropdown.addOption("any", "any");
            dropdown.addOption("6", "######");
            dropdown.addOption("5", "#####");
            dropdown.addOption("4", "####");
            dropdown.addOption("3", "###");
            dropdown.addOption("2", "##");
            dropdown.addOption("1", "#");
            dropdown.setValue((_b = (_a = this.plugin.settings.verseHeadingLevel) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "any");
            dropdown.onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.verseHeadingLevel = value === "any" ? undefined : Number(value);
                yield this.plugin.saveSettings();
            }));
        });
        containerEl.createEl("h4", { text: "Inserted prefixes/postfixes" });
        new Setting(containerEl)
            .setName("Line prefix")
            .setDesc("String inserted in front of every line, for example '>' for quote. Note: If you set 'Put each verse on a new line?' to true, the prefix will be inserted in front of every line.")
            .setClass("important-setting")
            .addText((inputBox) => inputBox
            .setPlaceholder("Insert prefix here")
            .setValue(this.plugin.settings.prefix)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.prefix = value;
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName("Link postfix")
            .setDesc("String inserted after biblical link, you can use \\n to insert newline.")
            .addText((inputBox) => inputBox
            .setPlaceholder("Insert postfix here")
            .setValue(this.plugin.settings.postfix)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.postfix = value;
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName("Each verse prefix")
            .setDesc("String inserted in front of every copied verse. You can use \"{n}\" where you want number of given verse inserted, for example \"**{n}** \" will make each verse start with bold verse number. You can also use \"{f}\" to insert name of the corresponding file (for example to create obsidian links). Leave empty for no prefix.")
            .addText((inputBox) => inputBox
            .setPlaceholder("Insert prefix here")
            .setValue(this.plugin.settings.eachVersePrefix)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.eachVersePrefix = value;
            yield this.plugin.saveSettings();
        })));
        containerEl.createEl("h4", { text: "Links" });
        new Setting(containerEl)
            .setName("Link to last verse?")
            .setDesc("Should last verse be linked in the visible link before text of verses?")
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.linkEndVerse)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.linkEndVerse = value;
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName("Add invisible links?")
            .setDesc("Invisible links are added to each verse used (so you can find the connections later), they are only visible in source mode.")
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.useInvisibleLinks)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.useInvisibleLinks = value;
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName("Link only default")
            .setDesc("What the link only option should be set to by default")
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.linkOnly)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.linkOnly = value;
            yield this.plugin.saveSettings();
        })));
        containerEl.createEl("h4", { text: "Output format" });
        new Setting(containerEl)
            .setName("Put each verse on a new line?")
            .setClass("important-setting")
            .setDesc("Each verse is inserted on a new line (with Link prefix).")
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.newLines)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.newLines = value;
            yield this.plugin.saveSettings();
            this.display();
        })));
        if (this.plugin.settings.newLines) {
            new Setting(containerEl)
                .setName("First line prefix")
                .setDesc("Special prefix that will be inserted in front of the first line only, right after the \"Line prefix\". Handy for callouts. (Only applied when Put each verse on a new line? is set to true)")
                .addText((inputBox) => inputBox
                .setPlaceholder("First line prefix")
                .setValue(this.plugin.settings.firstLinePrefix)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.firstLinePrefix = value;
                yield this.plugin.saveSettings();
            })));
        }
        else {
            new Setting(containerEl)
                .setName("Insert space between verses?")
                .setDesc("Should space be inserted between verses? (Only applied when Put each verse on a new line? is set to false. Useful for languages such as Chinese.)")
                .setDisabled(!this.plugin.settings.newLines)
                .addToggle((toggle) => toggle
                .setValue(this.plugin.settings.insertSpace)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.insertSpace = value;
                yield this.plugin.saveSettings();
            })));
        }
        containerEl.createEl("h4", { text: "Notation" });
        new Setting(containerEl)
            .setName("One verse notation")
            .setDesc("This is the symbol that will be used between chapter number and verse number when copying one verse. For example \".\" → Gen 1.1.")
            .addText((inputBox) => inputBox
            .setPlaceholder("Insert notation symbol here")
            .setValue(this.plugin.settings.oneVerseNotation)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.oneVerseNotation = value;
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName("Multiple verses notation")
            .setDesc("This is the symbol that will be used between chapter number and verse number when copying multiple verses. For example \",\" → Gen 1,1-3.")
            .addText((inputBox) => inputBox
            .setPlaceholder("Insert notation symbol here")
            .setValue(this.plugin.settings.multipleVersesNotation)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.multipleVersesNotation = value;
            yield this.plugin.saveSettings();
        })));
        containerEl.createEl("h4", { text: "Multiple translations" });
        new Setting(containerEl)
            .setName("Enable multiple translations")
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.enableMultipleTranslations)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.enableMultipleTranslations = value;
            yield this.plugin.saveSettings();
            this.display();
        })));
        if (this.plugin.settings.enableMultipleTranslations) {
            new Setting(containerEl)
                .setName("Paths to translations with their names")
                .setDesc("Input full paths from the root valut folder to folders containing Bible translations, each trnaslation on separate line. An example of one entry: \"Bible/NIV/\". The plugin will search for corresponding Bible files using given paths as starting points. Make sure there are no duplicate files in given paths, otherwise it is hard to tell what the output will be. The first translation will be considered your main translation.").addTextArea((inputBox) => inputBox
                .setPlaceholder("Bible/NIV/\nBible/ESV/")
                .setValue(this.plugin.settings.translationsPaths)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                const inputPaths = value.split(/\r?\n|\r/); // split user input by lines (regex takes into account all possible line endings)
                const paths = [];
                inputPaths.forEach((path) => {
                    if (path.at(-1) !== "/") { // Add potentionally missing '/' to path
                        paths.push(path + "/");
                    }
                    else {
                        paths.push(path);
                    }
                });
                this.plugin.settings.translationsPaths = value;
                this.plugin.settings.parsedTranslationPaths = paths;
                yield this.plugin.saveSettings();
            })));
            new Setting(containerEl)
                .setName("What to link")
                .setDesc("Choose what translations should be linked when copying a verse.")
                .addDropdown((dropdown) => {
                dropdown.addOption("all", "Link to all translations");
                dropdown.addOption("used", "Link only to used translation");
                dropdown.addOption("usedAndMain", "Link to used and main translation");
                dropdown.addOption("main", "Link only to main translation");
                dropdown.setValue(this.plugin.settings.translationLinkingType);
                dropdown.onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    this.plugin.settings.translationLinkingType = value;
                    yield this.plugin.saveSettings();
                }));
            });
        }
        containerEl.createEl("h4", { text: "Comments" });
        containerEl.createEl("p", { text: "Use this if you have comments right in the Biblical text that you want to ignore when copying verses." });
        new Setting(containerEl)
            .setName("Comment beginning")
            .setDesc("String that is used to mark the beginning of a comment, won't be used if it is set to an empty string.")
            .addText((inputBox) => inputBox
            .setPlaceholder("/*")
            .setValue(this.plugin.settings.commentStart)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.commentStart = value;
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName("Comment ending")
            .setDesc("String that is used to mark the end of a comment, won't be used if it is set to an empty string.")
            .addText((inputBox) => inputBox
            .setPlaceholder("*/")
            .setValue(this.plugin.settings.commentEnd)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.commentEnd = value;
            yield this.plugin.saveSettings();
        })));
        // LINK -------------------------------------------------------------------------------------------------------------
        containerEl.createEl("h1", { text: "Link Bible verses command" });
        containerEl.createEl("h4", { text: "File format" });
        new Setting(containerEl)
            .setName("Link separator")
            .setDesc("This is the separator that will be used when linking, e.g. if you enter '#' here, output will be [[Gen 1#1]]. If you are using headings to mark verses, use '#'. If you are using block references, use '^'.")
            .setClass("important-setting")
            .addText((inputBox) => inputBox
            .setPlaceholder("Insert separator here")
            .setValue(this.plugin.settings.linkSeparator)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.linkSeparator = value;
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName("Verse prefix")
            .setDesc('Fill this if you are using verse prefixes in your bible files, e.g. you have "v1" in your file → set to "v".')
            .setClass("important-setting")
            .addText((inputBox) => inputBox
            .setPlaceholder("Insert prefix here")
            .setValue(this.plugin.settings.versePrefix)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.versePrefix = value;
            yield this.plugin.saveSettings();
        })));
        containerEl.createEl("h4", { text: "Defaults" });
        new Setting(containerEl)
            .setName("Link type default value")
            .setDesc("Value that will be selected by default in link modal.")
            .addDropdown((dropdown) => {
            dropdown.addOption(LinkType.Basic, LinkType.Basic);
            dropdown.addOption(LinkType.Embedded, LinkType.Embedded);
            dropdown.addOption(LinkType.Invisible, LinkType.Invisible);
            dropdown.setValue(this.plugin.settings.linkTypePreset);
            dropdown.onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.linkTypePreset = value;
                yield this.plugin.saveSettings();
            }));
        });
        new Setting(containerEl)
            .setName("Use new lines default value")
            .setDesc("Value that will be selected by default in link modal.")
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.newLinePreset)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.newLinePreset = value;
            yield this.plugin.saveSettings();
        })));
        containerEl.createEl("h4", { text: "Format" });
        new Setting(containerEl)
            .setName("Capitalize book names?")
            .setDesc('Should book names be automatically capitalized? For example "1cOr" will be turned into "1Cor".')
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.shouldCapitalizeBookNames)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.shouldCapitalizeBookNames = value;
            yield this.plugin.saveSettings();
        })));
        containerEl.createEl("h4", { text: "Misc" });
        new Setting(containerEl)
            .setName("Verify files?")
            .setDesc("Verify existence of files you are trying to link, so that you are not inserting wrong references by mistake.")
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.verifyFilesWhenLinking)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.verifyFilesWhenLinking = value;
            yield this.plugin.saveSettings();
        })));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFNLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFaEUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRW5EOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFdBQVksU0FBUSxnQkFBZ0I7SUFHN0MsWUFBWSxHQUFRLEVBQUUsTUFBeUI7UUFDM0MsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRUQsT0FBTztRQUNILE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFN0IsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXBCLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLG9DQUFvQyxFQUFFLENBQUMsQ0FBQztRQUMzRSxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBRW5ELElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQzthQUNuQixPQUFPLENBQUMsY0FBYyxDQUFDO2FBQ3ZCLE9BQU8sQ0FBQyw2SEFBNkgsQ0FBQzthQUN0SSxRQUFRLENBQUMsbUJBQW1CLENBQUM7YUFDN0IsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FDbEIsUUFBUTthQUNILFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDckQsUUFBUSxDQUFDLENBQU8sS0FBSyxFQUFFLEVBQUU7WUFDdEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QyxJQUFJLEtBQUssS0FBSyxHQUFHO2dCQUFFLE9BQU87WUFDMUIsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN0QixJQUFJLE1BQU0sQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO2dCQUN6RCxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QixPQUFPO2FBQ1Y7WUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO1lBQzFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNyQyxDQUFDLENBQUEsQ0FBQyxDQUNULENBQUE7UUFFTCxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7YUFDbkIsT0FBTyxDQUFDLHFCQUFxQixDQUFDO2FBQzlCLE9BQU8sQ0FBQyxrSkFBa0osQ0FBQzthQUMzSixXQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTs7WUFDdEIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDaEMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUE7WUFDakMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7WUFDaEMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFDL0IsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDOUIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7WUFDN0IsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDNUIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFBLE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsaUJBQWlCLDBDQUFFLFFBQVEsRUFBRSxtQ0FBSSxLQUFLLENBQUMsQ0FBQTtZQUM5RSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQU8sS0FBSyxFQUFFLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGlCQUFpQixHQUFHLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyRixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDckMsQ0FBQyxDQUFBLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQyxDQUFBO1FBRU4sV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsNkJBQTZCLEVBQUUsQ0FBQyxDQUFDO1FBRXBFLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQzthQUNuQixPQUFPLENBQUMsYUFBYSxDQUFDO2FBQ3RCLE9BQU8sQ0FBQyxrTEFBa0wsQ0FBQzthQUMzTCxRQUFRLENBQUMsbUJBQW1CLENBQUM7YUFDN0IsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FDbEIsUUFBUTthQUNILGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQzthQUNwQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2FBQ3JDLFFBQVEsQ0FBQyxDQUFPLEtBQUssRUFBRSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JDLENBQUMsQ0FBQSxDQUFDLENBQ1QsQ0FBQTtRQUVMLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQzthQUNuQixPQUFPLENBQUMsY0FBYyxDQUFDO2FBQ3ZCLE9BQU8sQ0FBQyx5RUFBeUUsQ0FBQzthQUNsRixPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUNsQixRQUFRO2FBQ0gsY0FBYyxDQUFDLHFCQUFxQixDQUFDO2FBQ3JDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7YUFDdEMsUUFBUSxDQUFDLENBQU8sS0FBSyxFQUFFLEVBQUU7WUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNyQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDckMsQ0FBQyxDQUFBLENBQUMsQ0FDVCxDQUFBO1FBRUwsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO2FBQ25CLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQzthQUM1QixPQUFPLENBQUMscVVBQXFVLENBQUM7YUFDOVUsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FDbEIsUUFBUTthQUNILGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQzthQUNwQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDO2FBQzlDLFFBQVEsQ0FBQyxDQUFPLEtBQUssRUFBRSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7WUFDN0MsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JDLENBQUMsQ0FBQSxDQUFDLENBQ1QsQ0FBQTtRQUdMLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFOUMsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO2FBQ25CLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQzthQUM5QixPQUFPLENBQUMsd0VBQXdFLENBQUM7YUFDakYsU0FBUyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FDbEIsTUFBTTthQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUM7YUFDM0MsUUFBUSxDQUFDLENBQU8sS0FBSyxFQUFFLEVBQUU7WUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztZQUMxQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDckMsQ0FBQyxDQUFBLENBQUMsQ0FDVCxDQUFBO1FBRUwsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO2FBQ25CLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQzthQUMvQixPQUFPLENBQUMsNkhBQTZILENBQUM7YUFDdEksU0FBUyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FDbEIsTUFBTTthQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQzthQUNoRCxRQUFRLENBQUMsQ0FBTyxLQUFLLEVBQUUsRUFBRTtZQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFDL0MsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JDLENBQUMsQ0FBQSxDQUFDLENBQ1QsQ0FBQTtRQUVMLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQzthQUNuQixPQUFPLENBQUMsbUJBQW1CLENBQUM7YUFDNUIsT0FBTyxDQUFDLHVEQUF1RCxDQUFDO2FBQ2hFLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQ2xCLE1BQU07YUFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO2FBQ3ZDLFFBQVEsQ0FBQyxDQUFPLEtBQUssRUFBRSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDdEMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JDLENBQUMsQ0FBQSxDQUFDLENBQ1QsQ0FBQTtRQUdMLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUM7UUFFdEQsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO2FBQ25CLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQzthQUNqRCxRQUFRLENBQUMsbUJBQW1CLENBQUM7YUFDcEIsT0FBTyxDQUFDLDBEQUEwRCxDQUFDO2FBQ25FLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQ2xCLE1BQU07YUFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO2FBQ3ZDLFFBQVEsQ0FBQyxDQUFPLEtBQUssRUFBRSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDdEMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ25ELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNELENBQUMsQ0FBQSxDQUFDLENBQ1QsQ0FBQTtRQUVYLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFO1lBQ2xDLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQztpQkFDdEIsT0FBTyxDQUFDLG1CQUFtQixDQUFDO2lCQUM1QixPQUFPLENBQUMsNkxBQTZMLENBQUM7aUJBQ3RNLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQ3JCLFFBQVE7aUJBQ04sY0FBYyxDQUFDLG1CQUFtQixDQUFDO2lCQUNuQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDO2lCQUM5QyxRQUFRLENBQUMsQ0FBTyxLQUFLLEVBQUUsRUFBRTtnQkFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztnQkFDN0MsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2xDLENBQUMsQ0FBQSxDQUFDLENBQ0gsQ0FBQTtTQUNGO2FBQ0k7WUFDSixJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7aUJBQ3RCLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQztpQkFDdkMsT0FBTyxDQUFDLG1KQUFtSixDQUFDO2lCQUM1SixXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7aUJBQzNDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQ3JCLE1BQU07aUJBQ0osUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztpQkFDMUMsUUFBUSxDQUFDLENBQU8sS0FBSyxFQUFFLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7Z0JBQ3pDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNsQyxDQUFDLENBQUEsQ0FBQyxDQUNILENBQUE7U0FDRjtRQUlLLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFFakQsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO2FBQ25CLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQzthQUM3QixPQUFPLENBQUMsbUlBQW1JLENBQUM7YUFDNUksT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FDbEIsUUFBUTthQUNILGNBQWMsQ0FBQyw2QkFBNkIsQ0FBQzthQUM3QyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUM7YUFDL0MsUUFBUSxDQUFDLENBQU8sS0FBSyxFQUFFLEVBQUU7WUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1lBQzlDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNyQyxDQUFDLENBQUEsQ0FBQyxDQUNULENBQUE7UUFFTCxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7YUFDbkIsT0FBTyxDQUFDLDBCQUEwQixDQUFDO2FBQ25DLE9BQU8sQ0FBQywySUFBMkksQ0FBQzthQUNwSixPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUNsQixRQUFRO2FBQ0gsY0FBYyxDQUFDLDZCQUE2QixDQUFDO2FBQzdDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQzthQUNyRCxRQUFRLENBQUMsQ0FBTyxLQUFLLEVBQUUsRUFBRTtZQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUM7WUFDcEQsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JDLENBQUMsQ0FBQSxDQUFDLENBQ1QsQ0FBQTtRQUVMLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixFQUFFLENBQUMsQ0FBQztRQUU5RCxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7YUFDbkIsT0FBTyxDQUFDLDhCQUE4QixDQUFDO2FBQ3ZDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQ2xCLE1BQU07YUFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsMEJBQTBCLENBQUM7YUFDekQsUUFBUSxDQUFDLENBQU8sS0FBSyxFQUFFLEVBQUU7WUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEdBQUcsS0FBSyxDQUFDO1lBQ3hELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkIsQ0FBQyxDQUFBLENBQUMsQ0FDVCxDQUFBO1FBR0wsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRTtZQUNqRCxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7aUJBQ25CLE9BQU8sQ0FBQyx3Q0FBd0MsQ0FBQztpQkFDakQsT0FBTyxDQUFDLDJhQUEyYSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FDM2MsUUFBUTtpQkFDSCxjQUFjLENBQUMsd0JBQXdCLENBQUM7aUJBQ3hDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztpQkFDaEQsUUFBUSxDQUFDLENBQU8sS0FBSyxFQUFFLEVBQUU7Z0JBQ3RCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxpRkFBaUY7Z0JBQzdILE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQztnQkFDM0IsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO29CQUN4QixJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsRUFBRSx3Q0FBd0M7d0JBQy9ELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO3FCQUMxQjt5QkFDSTt3QkFDRCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO3FCQUNuQjtnQkFDTCxDQUFDLENBQUMsQ0FBQTtnQkFDRixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHNCQUFzQixHQUFHLEtBQUssQ0FBQztnQkFDcEQsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3JDLENBQUMsQ0FBQSxDQUFDLENBQ1QsQ0FBQTtZQUdMLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQztpQkFDbkIsT0FBTyxDQUFDLGNBQWMsQ0FBQztpQkFDdkIsT0FBTyxDQUFDLGlFQUFpRSxDQUFDO2lCQUMxRSxXQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDdEIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsMEJBQTBCLENBQUMsQ0FBQTtnQkFDckQsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsK0JBQStCLENBQUMsQ0FBQTtnQkFDM0QsUUFBUSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsbUNBQW1DLENBQUMsQ0FBQTtnQkFDdEUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsK0JBQStCLENBQUMsQ0FBQTtnQkFDM0QsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO2dCQUM5RCxRQUFRLENBQUMsUUFBUSxDQUFDLENBQU8sS0FBSyxFQUFFLEVBQUU7b0JBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHNCQUFzQixHQUFHLEtBQUssQ0FBQztvQkFDcEQsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNyQyxDQUFDLENBQUEsQ0FBQyxDQUFBO1lBQ04sQ0FBQyxDQUFDLENBQUE7U0FDZjtRQUVELFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDakQsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsdUdBQXVHLEVBQUUsQ0FBQyxDQUFDO1FBQzdJLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQzthQUN0QixPQUFPLENBQUMsbUJBQW1CLENBQUM7YUFDNUIsT0FBTyxDQUFDLHdHQUF3RyxDQUFDO2FBQ2pILE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQ3JCLFFBQVE7YUFDTixjQUFjLENBQUMsSUFBSSxDQUFDO2FBQ3BCLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUM7YUFDM0MsUUFBUSxDQUFDLENBQU8sS0FBSyxFQUFFLEVBQUU7WUFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztZQUMxQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDbEMsQ0FBQyxDQUFBLENBQUMsQ0FDSCxDQUFBO1FBRUYsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3RCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzthQUN6QixPQUFPLENBQUMsa0dBQWtHLENBQUM7YUFDM0csT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FDckIsUUFBUTthQUNOLGNBQWMsQ0FBQyxJQUFJLENBQUM7YUFDcEIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQzthQUN6QyxRQUFRLENBQUMsQ0FBTyxLQUFLLEVBQUUsRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3hDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNsQyxDQUFDLENBQUEsQ0FBQyxDQUNILENBQUE7UUFFSSxxSEFBcUg7UUFFckgsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDO1FBRWxFLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7UUFDcEQsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO2FBQ25CLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzthQUN6QixPQUFPLENBQUMsOE1BQThNLENBQUM7YUFDdk4sUUFBUSxDQUFDLG1CQUFtQixDQUFDO2FBQzdCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQ2xCLFFBQVE7YUFDSCxjQUFjLENBQUMsdUJBQXVCLENBQUM7YUFDdkMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQzthQUM1QyxRQUFRLENBQUMsQ0FBTyxLQUFLLEVBQUUsRUFBRTtZQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO1lBQzNDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNyQyxDQUFDLENBQUEsQ0FBQyxDQUNULENBQUE7UUFHTCxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7YUFDbkIsT0FBTyxDQUFDLGNBQWMsQ0FBQzthQUN2QixPQUFPLENBQUMsOEdBQThHLENBQUM7YUFDdkgsUUFBUSxDQUFDLG1CQUFtQixDQUFDO2FBQzdCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQ2xCLFFBQVE7YUFDSCxjQUFjLENBQUMsb0JBQW9CLENBQUM7YUFDcEMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQzthQUMxQyxRQUFRLENBQUMsQ0FBTyxLQUFLLEVBQUUsRUFBRTtZQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3pDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNyQyxDQUFDLENBQUEsQ0FBQyxDQUNULENBQUE7UUFHTCxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBRWpELElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQzthQUNuQixPQUFPLENBQUMseUJBQXlCLENBQUM7YUFDbEMsT0FBTyxDQUFDLHVEQUF1RCxDQUFDO2FBQ2hFLFdBQVcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ3RCLFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDbEQsUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUN4RCxRQUFRLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQzFELFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUE7WUFDdEQsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFPLEtBQUssRUFBRSxFQUFFO2dCQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEdBQUcsS0FBaUIsQ0FBQztnQkFDeEQsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3JDLENBQUMsQ0FBQSxDQUFDLENBQUE7UUFDTixDQUFDLENBQUMsQ0FBQTtRQUVaLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQzthQUN0QixPQUFPLENBQUMsNkJBQTZCLENBQUM7YUFDdEMsT0FBTyxDQUFDLHVEQUF1RCxDQUFDO2FBQ2hFLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQ3JCLE1BQU07YUFDSixRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDO2FBQzVDLFFBQVEsQ0FBQyxDQUFPLEtBQUssRUFBRSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDM0MsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xDLENBQUMsQ0FBQSxDQUFDLENBQ0gsQ0FBQztRQUVILFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDL0MsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3RCLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQzthQUNqQyxPQUFPLENBQ1AsZ0dBQWdHLENBQ2hHO2FBQ0EsU0FBUyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FDckIsTUFBTTthQUNKLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQzthQUN4RCxRQUFRLENBQUMsQ0FBTyxLQUFLLEVBQUUsRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsR0FBRyxLQUFLLENBQUM7WUFDdkQsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xDLENBQUMsQ0FBQSxDQUFDLENBQ0gsQ0FBQztRQUVHLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFFN0MsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO2FBQ25CLE9BQU8sQ0FBQyxlQUFlLENBQUM7YUFDeEIsT0FBTyxDQUFDLDhHQUE4RyxDQUFDO2FBQ3ZILFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQ2xCLE1BQU07YUFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUM7YUFDckQsUUFBUSxDQUFDLENBQU8sS0FBSyxFQUFFLEVBQUU7WUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEdBQUcsS0FBSyxDQUFDO1lBQ3BELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNyQyxDQUFDLENBQUEsQ0FBQyxDQUNULENBQUE7SUFHVCxDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FwcCwgTm90aWNlLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nfSBmcm9tIFwib2JzaWRpYW5cIjtcclxuaW1wb3J0IEJpYmxlTGlua2VyUGx1Z2luIGZyb20gXCIuL21haW5cIjtcclxuaW1wb3J0IHtMaW5rVHlwZX0gZnJvbSBcIi4vbW9kYWxzL2xpbmstdmVyc2UtbW9kYWxcIjtcclxuXHJcbi8qKlxyXG4gKiBTZXR0aW5ncyBmb3IgcGx1Z2luXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU2V0dGluZ3NUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcclxuICAgIHBsdWdpbjogQmlibGVMaW5rZXJQbHVnaW47XHJcblxyXG4gICAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogQmlibGVMaW5rZXJQbHVnaW4pIHtcclxuICAgICAgICBzdXBlcihhcHAsIHBsdWdpbik7XHJcbiAgICAgICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcGxheSgpIHtcclxuICAgICAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xyXG5cclxuICAgICAgICBjb250YWluZXJFbC5lbXB0eSgpO1xyXG5cclxuICAgICAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgxXCIsIHsgdGV4dDogXCJDb3B5IGFuZCBMaW5rIEJpYmxlIHZlcnNlcyBjb21tYW5kXCIgfSk7XHJcbiAgICAgICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJoNFwiLCB7IHRleHQ6IFwiRnVuY3Rpb25hbFwiIH0pO1xyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoXCJWZXJzZSBvZmZzZXRcIilcclxuICAgICAgICAgICAgLnNldERlc2MoJ0NoYW5nZSB0aGlzIGlmIHdyb25nIHZlcnNlcyBhcmUgYmVpbmcgbGlua2VkLCBlLmcuIHlvdSB3YW50IFwiR2VuIDEsMS0zXCIgYnV0IG91dHB1dCBpcyB0ZXh0IGZyb20gdmVyc2VzIDItNCDihpIgc2V0IHRoaXMgdG8gLTEnKVxyXG4gICAgICAgICAgICAuc2V0Q2xhc3MoXCJpbXBvcnRhbnQtc2V0dGluZ1wiKVxyXG4gICAgICAgICAgICAuYWRkVGV4dCgoaW5wdXRCb3gpID0+XHJcbiAgICAgICAgICAgICAgICBpbnB1dEJveFxyXG4gICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy52ZXJzZU9mZnNldC50b1N0cmluZygpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSBcIi1cIikgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTnVtYmVyLmlzTmFOKG51bWJlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJJbnZhbGlkIGlucHV0LCBwbGVhc2UgaW5zZXJ0IHZhbGlkIGludGVnZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dEJveC5zZXRWYWx1ZShcIlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy52ZXJzZU9mZnNldCA9IG51bWJlcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoXCJWZXJzZSBoZWFkaW5nIGxldmVsXCIpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKCdJZiBzZXQsIG9ubHkgaGVhZGluZ3Mgb2Ygc3BlY2lmaWVkIGxldmVsIGFyZSBjb25zaWRlcmVkIHZlcnNlcyAoaWYgZmlyc3QgaGVhZGluZyBvZiB0aGlzIGxldmVsIGlzIGFsd2F5cyBhIHZlcnNlLCBhbHNvIHNldCBcIlZlcnNlIG9mZnNldFwiIHRvIC0xKScpXHJcbiAgICAgICAgICAgIC5hZGREcm9wZG93bigoZHJvcGRvd24pID0+IHtcclxuICAgICAgICAgICAgICAgIGRyb3Bkb3duLmFkZE9wdGlvbihcImFueVwiLCBcImFueVwiKVxyXG4gICAgICAgICAgICAgICAgZHJvcGRvd24uYWRkT3B0aW9uKFwiNlwiLCBcIiMjIyMjI1wiKVxyXG4gICAgICAgICAgICAgICAgZHJvcGRvd24uYWRkT3B0aW9uKFwiNVwiLCBcIiMjIyMjXCIpXHJcbiAgICAgICAgICAgICAgICBkcm9wZG93bi5hZGRPcHRpb24oXCI0XCIsIFwiIyMjI1wiKVxyXG4gICAgICAgICAgICAgICAgZHJvcGRvd24uYWRkT3B0aW9uKFwiM1wiLCBcIiMjI1wiKVxyXG4gICAgICAgICAgICAgICAgZHJvcGRvd24uYWRkT3B0aW9uKFwiMlwiLCBcIiMjXCIpXHJcbiAgICAgICAgICAgICAgICBkcm9wZG93bi5hZGRPcHRpb24oXCIxXCIsIFwiI1wiKVxyXG4gICAgICAgICAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudmVyc2VIZWFkaW5nTGV2ZWw/LnRvU3RyaW5nKCkgPz8gXCJhbnlcIilcclxuICAgICAgICAgICAgICAgIGRyb3Bkb3duLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnZlcnNlSGVhZGluZ0xldmVsID0gdmFsdWUgPT09IFwiYW55XCIgPyB1bmRlZmluZWQgOiBOdW1iZXIodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJoNFwiLCB7IHRleHQ6IFwiSW5zZXJ0ZWQgcHJlZml4ZXMvcG9zdGZpeGVzXCIgfSk7XHJcblxyXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgICAgICAuc2V0TmFtZShcIkxpbmUgcHJlZml4XCIpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKFwiU3RyaW5nIGluc2VydGVkIGluIGZyb250IG9mIGV2ZXJ5IGxpbmUsIGZvciBleGFtcGxlICc+JyBmb3IgcXVvdGUuIE5vdGU6IElmIHlvdSBzZXQgJ1B1dCBlYWNoIHZlcnNlIG9uIGEgbmV3IGxpbmU/JyB0byB0cnVlLCB0aGUgcHJlZml4IHdpbGwgYmUgaW5zZXJ0ZWQgaW4gZnJvbnQgb2YgZXZlcnkgbGluZS5cIilcclxuICAgICAgICAgICAgLnNldENsYXNzKFwiaW1wb3J0YW50LXNldHRpbmdcIilcclxuICAgICAgICAgICAgLmFkZFRleHQoKGlucHV0Qm94KSA9PlxyXG4gICAgICAgICAgICAgICAgaW5wdXRCb3hcclxuICAgICAgICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJJbnNlcnQgcHJlZml4IGhlcmVcIilcclxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MucHJlZml4KVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MucHJlZml4ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIClcclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKFwiTGluayBwb3N0Zml4XCIpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKFwiU3RyaW5nIGluc2VydGVkIGFmdGVyIGJpYmxpY2FsIGxpbmssIHlvdSBjYW4gdXNlIFxcXFxuIHRvIGluc2VydCBuZXdsaW5lLlwiKVxyXG4gICAgICAgICAgICAuYWRkVGV4dCgoaW5wdXRCb3gpID0+XHJcbiAgICAgICAgICAgICAgICBpbnB1dEJveFxyXG4gICAgICAgICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkluc2VydCBwb3N0Zml4IGhlcmVcIilcclxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MucG9zdGZpeClcclxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnBvc3RmaXggPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoXCJFYWNoIHZlcnNlIHByZWZpeFwiKVxyXG4gICAgICAgICAgICAuc2V0RGVzYyhcIlN0cmluZyBpbnNlcnRlZCBpbiBmcm9udCBvZiBldmVyeSBjb3BpZWQgdmVyc2UuIFlvdSBjYW4gdXNlIFxcXCJ7bn1cXFwiIHdoZXJlIHlvdSB3YW50IG51bWJlciBvZiBnaXZlbiB2ZXJzZSBpbnNlcnRlZCwgZm9yIGV4YW1wbGUgXFxcIioqe259KiogXFxcIiB3aWxsIG1ha2UgZWFjaCB2ZXJzZSBzdGFydCB3aXRoIGJvbGQgdmVyc2UgbnVtYmVyLiBZb3UgY2FuIGFsc28gdXNlIFxcXCJ7Zn1cXFwiIHRvIGluc2VydCBuYW1lIG9mIHRoZSBjb3JyZXNwb25kaW5nIGZpbGUgKGZvciBleGFtcGxlIHRvIGNyZWF0ZSBvYnNpZGlhbiBsaW5rcykuIExlYXZlIGVtcHR5IGZvciBubyBwcmVmaXguXCIpXHJcbiAgICAgICAgICAgIC5hZGRUZXh0KChpbnB1dEJveCkgPT5cclxuICAgICAgICAgICAgICAgIGlucHV0Qm94XHJcbiAgICAgICAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiSW5zZXJ0IHByZWZpeCBoZXJlXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmVhY2hWZXJzZVByZWZpeClcclxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmVhY2hWZXJzZVByZWZpeCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApXHJcblxyXG5cclxuICAgICAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImg0XCIsIHsgdGV4dDogXCJMaW5rc1wiIH0pO1xyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoXCJMaW5rIHRvIGxhc3QgdmVyc2U/XCIpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKFwiU2hvdWxkIGxhc3QgdmVyc2UgYmUgbGlua2VkIGluIHRoZSB2aXNpYmxlIGxpbmsgYmVmb3JlIHRleHQgb2YgdmVyc2VzP1wiKVxyXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVcclxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubGlua0VuZFZlcnNlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubGlua0VuZFZlcnNlID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIClcclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKFwiQWRkIGludmlzaWJsZSBsaW5rcz9cIilcclxuICAgICAgICAgICAgLnNldERlc2MoXCJJbnZpc2libGUgbGlua3MgYXJlIGFkZGVkIHRvIGVhY2ggdmVyc2UgdXNlZCAoc28geW91IGNhbiBmaW5kIHRoZSBjb25uZWN0aW9ucyBsYXRlciksIHRoZXkgYXJlIG9ubHkgdmlzaWJsZSBpbiBzb3VyY2UgbW9kZS5cIilcclxuICAgICAgICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxyXG4gICAgICAgICAgICAgICAgdG9nZ2xlXHJcbiAgICAgICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnVzZUludmlzaWJsZUxpbmtzKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MudXNlSW52aXNpYmxlTGlua3MgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoXCJMaW5rIG9ubHkgZGVmYXVsdFwiKVxyXG4gICAgICAgICAgICAuc2V0RGVzYyhcIldoYXQgdGhlIGxpbmsgb25seSBvcHRpb24gc2hvdWxkIGJlIHNldCB0byBieSBkZWZhdWx0XCIpXHJcbiAgICAgICAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cclxuICAgICAgICAgICAgICAgIHRvZ2dsZVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5saW5rT25seSlcclxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmxpbmtPbmx5ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIClcclxuXHJcblxyXG4gICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiaDRcIiwgeyB0ZXh0OiBcIk91dHB1dCBmb3JtYXRcIiB9KTtcclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKFwiUHV0IGVhY2ggdmVyc2Ugb24gYSBuZXcgbGluZT9cIilcclxuXHRcdFx0LnNldENsYXNzKFwiaW1wb3J0YW50LXNldHRpbmdcIilcclxuICAgICAgICAgICAgLnNldERlc2MoXCJFYWNoIHZlcnNlIGlzIGluc2VydGVkIG9uIGEgbmV3IGxpbmUgKHdpdGggTGluayBwcmVmaXgpLlwiKVxyXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVcclxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubmV3TGluZXMpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5uZXdMaW5lcyA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5kaXNwbGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKVxyXG5cclxuXHRcdGlmICh0aGlzLnBsdWdpbi5zZXR0aW5ncy5uZXdMaW5lcykge1xyXG5cdFx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuXHRcdFx0XHQuc2V0TmFtZShcIkZpcnN0IGxpbmUgcHJlZml4XCIpXHJcblx0XHRcdFx0LnNldERlc2MoXCJTcGVjaWFsIHByZWZpeCB0aGF0IHdpbGwgYmUgaW5zZXJ0ZWQgaW4gZnJvbnQgb2YgdGhlIGZpcnN0IGxpbmUgb25seSwgcmlnaHQgYWZ0ZXIgdGhlIFxcXCJMaW5lIHByZWZpeFxcXCIuIEhhbmR5IGZvciBjYWxsb3V0cy4gKE9ubHkgYXBwbGllZCB3aGVuIFB1dCBlYWNoIHZlcnNlIG9uIGEgbmV3IGxpbmU/IGlzIHNldCB0byB0cnVlKVwiKVxyXG5cdFx0XHRcdC5hZGRUZXh0KChpbnB1dEJveCkgPT5cclxuXHRcdFx0XHRcdGlucHV0Qm94XHJcblx0XHRcdFx0XHRcdC5zZXRQbGFjZWhvbGRlcihcIkZpcnN0IGxpbmUgcHJlZml4XCIpXHJcblx0XHRcdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5maXJzdExpbmVQcmVmaXgpXHJcblx0XHRcdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5maXJzdExpbmVQcmVmaXggPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuXHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHQpXHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcblx0XHRcdFx0LnNldE5hbWUoXCJJbnNlcnQgc3BhY2UgYmV0d2VlbiB2ZXJzZXM/XCIpXHJcblx0XHRcdFx0LnNldERlc2MoXCJTaG91bGQgc3BhY2UgYmUgaW5zZXJ0ZWQgYmV0d2VlbiB2ZXJzZXM/IChPbmx5IGFwcGxpZWQgd2hlbiBQdXQgZWFjaCB2ZXJzZSBvbiBhIG5ldyBsaW5lPyBpcyBzZXQgdG8gZmFsc2UuIFVzZWZ1bCBmb3IgbGFuZ3VhZ2VzIHN1Y2ggYXMgQ2hpbmVzZS4pXCIpXHJcblx0XHRcdFx0LnNldERpc2FibGVkKCF0aGlzLnBsdWdpbi5zZXR0aW5ncy5uZXdMaW5lcylcclxuXHRcdFx0XHQuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XHJcblx0XHRcdFx0XHR0b2dnbGVcclxuXHRcdFx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmluc2VydFNwYWNlKVxyXG5cdFx0XHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MuaW5zZXJ0U3BhY2UgPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuXHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHQpXHJcblx0XHR9XHJcblxyXG5cclxuXHJcbiAgICAgICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJoNFwiLCB7IHRleHQ6IFwiTm90YXRpb25cIiB9KTtcclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKFwiT25lIHZlcnNlIG5vdGF0aW9uXCIpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKFwiVGhpcyBpcyB0aGUgc3ltYm9sIHRoYXQgd2lsbCBiZSB1c2VkIGJldHdlZW4gY2hhcHRlciBudW1iZXIgYW5kIHZlcnNlIG51bWJlciB3aGVuIGNvcHlpbmcgb25lIHZlcnNlLiBGb3IgZXhhbXBsZSBcXFwiLlxcXCIg4oaSIEdlbiAxLjEuXCIpXHJcbiAgICAgICAgICAgIC5hZGRUZXh0KChpbnB1dEJveCkgPT5cclxuICAgICAgICAgICAgICAgIGlucHV0Qm94XHJcbiAgICAgICAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiSW5zZXJ0IG5vdGF0aW9uIHN5bWJvbCBoZXJlXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm9uZVZlcnNlTm90YXRpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5vbmVWZXJzZU5vdGF0aW9uID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIClcclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKFwiTXVsdGlwbGUgdmVyc2VzIG5vdGF0aW9uXCIpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKFwiVGhpcyBpcyB0aGUgc3ltYm9sIHRoYXQgd2lsbCBiZSB1c2VkIGJldHdlZW4gY2hhcHRlciBudW1iZXIgYW5kIHZlcnNlIG51bWJlciB3aGVuIGNvcHlpbmcgbXVsdGlwbGUgdmVyc2VzLiBGb3IgZXhhbXBsZSBcXFwiLFxcXCIg4oaSIEdlbiAxLDEtMy5cIilcclxuICAgICAgICAgICAgLmFkZFRleHQoKGlucHV0Qm94KSA9PlxyXG4gICAgICAgICAgICAgICAgaW5wdXRCb3hcclxuICAgICAgICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJJbnNlcnQgbm90YXRpb24gc3ltYm9sIGhlcmVcIilcclxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubXVsdGlwbGVWZXJzZXNOb3RhdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLm11bHRpcGxlVmVyc2VzTm90YXRpb24gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImg0XCIsIHsgdGV4dDogXCJNdWx0aXBsZSB0cmFuc2xhdGlvbnNcIiB9KTtcclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKFwiRW5hYmxlIG11bHRpcGxlIHRyYW5zbGF0aW9uc1wiKVxyXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVcclxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlTXVsdGlwbGVUcmFuc2xhdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVNdWx0aXBsZVRyYW5zbGF0aW9ucyA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKVxyXG5cclxuXHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZU11bHRpcGxlVHJhbnNsYXRpb25zKSB7XHJcbiAgICAgICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgICAgICAgICAgLnNldE5hbWUoXCJQYXRocyB0byB0cmFuc2xhdGlvbnMgd2l0aCB0aGVpciBuYW1lc1wiKVxyXG4gICAgICAgICAgICAgICAgLnNldERlc2MoXCJJbnB1dCBmdWxsIHBhdGhzIGZyb20gdGhlIHJvb3QgdmFsdXQgZm9sZGVyIHRvIGZvbGRlcnMgY29udGFpbmluZyBCaWJsZSB0cmFuc2xhdGlvbnMsIGVhY2ggdHJuYXNsYXRpb24gb24gc2VwYXJhdGUgbGluZS4gQW4gZXhhbXBsZSBvZiBvbmUgZW50cnk6IFxcXCJCaWJsZS9OSVYvXFxcIi4gVGhlIHBsdWdpbiB3aWxsIHNlYXJjaCBmb3IgY29ycmVzcG9uZGluZyBCaWJsZSBmaWxlcyB1c2luZyBnaXZlbiBwYXRocyBhcyBzdGFydGluZyBwb2ludHMuIE1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gZHVwbGljYXRlIGZpbGVzIGluIGdpdmVuIHBhdGhzLCBvdGhlcndpc2UgaXQgaXMgaGFyZCB0byB0ZWxsIHdoYXQgdGhlIG91dHB1dCB3aWxsIGJlLiBUaGUgZmlyc3QgdHJhbnNsYXRpb24gd2lsbCBiZSBjb25zaWRlcmVkIHlvdXIgbWFpbiB0cmFuc2xhdGlvbi5cIikuYWRkVGV4dEFyZWEoKGlucHV0Qm94KSA9PlxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Qm94XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkJpYmxlL05JVi9cXG5CaWJsZS9FU1YvXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy50cmFuc2xhdGlvbnNQYXRocylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5wdXRQYXRocyA9IHZhbHVlLnNwbGl0KC9cXHI/XFxufFxcci8pOyAvLyBzcGxpdCB1c2VyIGlucHV0IGJ5IGxpbmVzIChyZWdleCB0YWtlcyBpbnRvIGFjY291bnQgYWxsIHBvc3NpYmxlIGxpbmUgZW5kaW5ncylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRQYXRocy5mb3JFYWNoKChwYXRoKSA9PiB7IC8vIHBhcnNlIHVzZXIgaW5wdXQgZm9yIGxhdGVyIHVzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXRoLmF0KC0xKSAhPT0gXCIvXCIpIHsgLy8gQWRkIHBvdGVudGlvbmFsbHkgbWlzc2luZyAnLycgdG8gcGF0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRocy5wdXNoKHBhdGggKyBcIi9cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRocy5wdXNoKHBhdGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnRyYW5zbGF0aW9uc1BhdGhzID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5wYXJzZWRUcmFuc2xhdGlvblBhdGhzID0gcGF0aHM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIClcclxuXHJcblxyXG4gICAgICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgICAgIC5zZXROYW1lKFwiV2hhdCB0byBsaW5rXCIpXHJcbiAgICAgICAgICAgICAgICAuc2V0RGVzYyhcIkNob29zZSB3aGF0IHRyYW5zbGF0aW9ucyBzaG91bGQgYmUgbGlua2VkIHdoZW4gY29weWluZyBhIHZlcnNlLlwiKVxyXG4gICAgICAgICAgICAgICAgLmFkZERyb3Bkb3duKChkcm9wZG93bikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duLmFkZE9wdGlvbihcImFsbFwiLCBcIkxpbmsgdG8gYWxsIHRyYW5zbGF0aW9uc1wiKVxyXG4gICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duLmFkZE9wdGlvbihcInVzZWRcIiwgXCJMaW5rIG9ubHkgdG8gdXNlZCB0cmFuc2xhdGlvblwiKVxyXG4gICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duLmFkZE9wdGlvbihcInVzZWRBbmRNYWluXCIsIFwiTGluayB0byB1c2VkIGFuZCBtYWluIHRyYW5zbGF0aW9uXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgZHJvcGRvd24uYWRkT3B0aW9uKFwibWFpblwiLCBcIkxpbmsgb25seSB0byBtYWluIHRyYW5zbGF0aW9uXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudHJhbnNsYXRpb25MaW5raW5nVHlwZSlcclxuICAgICAgICAgICAgICAgICAgICBkcm9wZG93bi5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MudHJhbnNsYXRpb25MaW5raW5nVHlwZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSlcclxuXHRcdH1cclxuXHJcblx0XHRjb250YWluZXJFbC5jcmVhdGVFbChcImg0XCIsIHsgdGV4dDogXCJDb21tZW50c1wiIH0pO1xyXG5cdFx0Y29udGFpbmVyRWwuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogXCJVc2UgdGhpcyBpZiB5b3UgaGF2ZSBjb21tZW50cyByaWdodCBpbiB0aGUgQmlibGljYWwgdGV4dCB0aGF0IHlvdSB3YW50IHRvIGlnbm9yZSB3aGVuIGNvcHlpbmcgdmVyc2VzLlwiIH0pO1xyXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcblx0XHRcdC5zZXROYW1lKFwiQ29tbWVudCBiZWdpbm5pbmdcIilcclxuXHRcdFx0LnNldERlc2MoXCJTdHJpbmcgdGhhdCBpcyB1c2VkIHRvIG1hcmsgdGhlIGJlZ2lubmluZyBvZiBhIGNvbW1lbnQsIHdvbid0IGJlIHVzZWQgaWYgaXQgaXMgc2V0IHRvIGFuIGVtcHR5IHN0cmluZy5cIilcclxuXHRcdFx0LmFkZFRleHQoKGlucHV0Qm94KSA9PlxyXG5cdFx0XHRcdGlucHV0Qm94XHJcblx0XHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoXCIvKlwiKVxyXG5cdFx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNvbW1lbnRTdGFydClcclxuXHRcdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuXHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MuY29tbWVudFN0YXJ0ID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0KVxyXG5cclxuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG5cdFx0XHQuc2V0TmFtZShcIkNvbW1lbnQgZW5kaW5nXCIpXHJcblx0XHRcdC5zZXREZXNjKFwiU3RyaW5nIHRoYXQgaXMgdXNlZCB0byBtYXJrIHRoZSBlbmQgb2YgYSBjb21tZW50LCB3b24ndCBiZSB1c2VkIGlmIGl0IGlzIHNldCB0byBhbiBlbXB0eSBzdHJpbmcuXCIpXHJcblx0XHRcdC5hZGRUZXh0KChpbnB1dEJveCkgPT5cclxuXHRcdFx0XHRpbnB1dEJveFxyXG5cdFx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKFwiKi9cIilcclxuXHRcdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5jb21tZW50RW5kKVxyXG5cdFx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5jb21tZW50RW5kID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0KVxyXG5cclxuICAgICAgICAvLyBMSU5LIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJoMVwiLCB7IHRleHQ6IFwiTGluayBCaWJsZSB2ZXJzZXMgY29tbWFuZFwiIH0pO1xyXG5cclxuICAgICAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImg0XCIsIHsgdGV4dDogXCJGaWxlIGZvcm1hdFwiIH0pO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgICAgICAuc2V0TmFtZShcIkxpbmsgc2VwYXJhdG9yXCIpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKFwiVGhpcyBpcyB0aGUgc2VwYXJhdG9yIHRoYXQgd2lsbCBiZSB1c2VkIHdoZW4gbGlua2luZywgZS5nLiBpZiB5b3UgZW50ZXIgJyMnIGhlcmUsIG91dHB1dCB3aWxsIGJlIFtbR2VuIDEjMV1dLiBJZiB5b3UgYXJlIHVzaW5nIGhlYWRpbmdzIHRvIG1hcmsgdmVyc2VzLCB1c2UgJyMnLiBJZiB5b3UgYXJlIHVzaW5nIGJsb2NrIHJlZmVyZW5jZXMsIHVzZSAnXicuXCIpXHJcbiAgICAgICAgICAgIC5zZXRDbGFzcyhcImltcG9ydGFudC1zZXR0aW5nXCIpXHJcbiAgICAgICAgICAgIC5hZGRUZXh0KChpbnB1dEJveCkgPT5cclxuICAgICAgICAgICAgICAgIGlucHV0Qm94XHJcbiAgICAgICAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiSW5zZXJ0IHNlcGFyYXRvciBoZXJlXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmxpbmtTZXBhcmF0b3IpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5saW5rU2VwYXJhdG9yID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIClcclxuXHJcblxyXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgICAgICAuc2V0TmFtZShcIlZlcnNlIHByZWZpeFwiKVxyXG4gICAgICAgICAgICAuc2V0RGVzYygnRmlsbCB0aGlzIGlmIHlvdSBhcmUgdXNpbmcgdmVyc2UgcHJlZml4ZXMgaW4geW91ciBiaWJsZSBmaWxlcywgZS5nLiB5b3UgaGF2ZSBcInYxXCIgaW4geW91ciBmaWxlIOKGkiBzZXQgdG8gXCJ2XCIuJylcclxuICAgICAgICAgICAgLnNldENsYXNzKFwiaW1wb3J0YW50LXNldHRpbmdcIilcclxuICAgICAgICAgICAgLmFkZFRleHQoKGlucHV0Qm94KSA9PlxyXG4gICAgICAgICAgICAgICAgaW5wdXRCb3hcclxuICAgICAgICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJJbnNlcnQgcHJlZml4IGhlcmVcIilcclxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudmVyc2VQcmVmaXgpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy52ZXJzZVByZWZpeCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApXHJcblxyXG5cclxuICAgICAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImg0XCIsIHsgdGV4dDogXCJEZWZhdWx0c1wiIH0pO1xyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoXCJMaW5rIHR5cGUgZGVmYXVsdCB2YWx1ZVwiKVxyXG4gICAgICAgICAgICAuc2V0RGVzYyhcIlZhbHVlIHRoYXQgd2lsbCBiZSBzZWxlY3RlZCBieSBkZWZhdWx0IGluIGxpbmsgbW9kYWwuXCIpXHJcbiAgICAgICAgICAgIC5hZGREcm9wZG93bigoZHJvcGRvd24pID0+IHtcclxuICAgICAgICAgICAgICAgIGRyb3Bkb3duLmFkZE9wdGlvbihMaW5rVHlwZS5CYXNpYywgTGlua1R5cGUuQmFzaWMpXHJcbiAgICAgICAgICAgICAgICBkcm9wZG93bi5hZGRPcHRpb24oTGlua1R5cGUuRW1iZWRkZWQsIExpbmtUeXBlLkVtYmVkZGVkKVxyXG4gICAgICAgICAgICAgICAgZHJvcGRvd24uYWRkT3B0aW9uKExpbmtUeXBlLkludmlzaWJsZSwgTGlua1R5cGUuSW52aXNpYmxlKVxyXG4gICAgICAgICAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubGlua1R5cGVQcmVzZXQpXHJcbiAgICAgICAgICAgICAgICBkcm9wZG93bi5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5saW5rVHlwZVByZXNldCA9IHZhbHVlIGFzIExpbmtUeXBlO1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuXHJcblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuXHRcdFx0LnNldE5hbWUoXCJVc2UgbmV3IGxpbmVzIGRlZmF1bHQgdmFsdWVcIilcclxuXHRcdFx0LnNldERlc2MoXCJWYWx1ZSB0aGF0IHdpbGwgYmUgc2VsZWN0ZWQgYnkgZGVmYXVsdCBpbiBsaW5rIG1vZGFsLlwiKVxyXG5cdFx0XHQuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XHJcblx0XHRcdFx0dG9nZ2xlXHJcblx0XHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubmV3TGluZVByZXNldClcclxuXHRcdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuXHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MubmV3TGluZVByZXNldCA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0Y29udGFpbmVyRWwuY3JlYXRlRWwoXCJoNFwiLCB7IHRleHQ6IFwiRm9ybWF0XCIgfSk7XHJcblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuXHRcdFx0LnNldE5hbWUoXCJDYXBpdGFsaXplIGJvb2sgbmFtZXM/XCIpXHJcblx0XHRcdC5zZXREZXNjKFxyXG5cdFx0XHRcdCdTaG91bGQgYm9vayBuYW1lcyBiZSBhdXRvbWF0aWNhbGx5IGNhcGl0YWxpemVkPyBGb3IgZXhhbXBsZSBcIjFjT3JcIiB3aWxsIGJlIHR1cm5lZCBpbnRvIFwiMUNvclwiLidcclxuXHRcdFx0KVxyXG5cdFx0XHQuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XHJcblx0XHRcdFx0dG9nZ2xlXHJcblx0XHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc2hvdWxkQ2FwaXRhbGl6ZUJvb2tOYW1lcylcclxuXHRcdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuXHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3Muc2hvdWxkQ2FwaXRhbGl6ZUJvb2tOYW1lcyA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdCk7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiaDRcIiwgeyB0ZXh0OiBcIk1pc2NcIiB9KTtcclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKFwiVmVyaWZ5IGZpbGVzP1wiKVxyXG4gICAgICAgICAgICAuc2V0RGVzYyhcIlZlcmlmeSBleGlzdGVuY2Ugb2YgZmlsZXMgeW91IGFyZSB0cnlpbmcgdG8gbGluaywgc28gdGhhdCB5b3UgYXJlIG5vdCBpbnNlcnRpbmcgd3JvbmcgcmVmZXJlbmNlcyBieSBtaXN0YWtlLlwiKVxyXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVcclxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudmVyaWZ5RmlsZXNXaGVuTGlua2luZylcclxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnZlcmlmeUZpbGVzV2hlbkxpbmtpbmcgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKVxyXG5cclxuXHJcbiAgICB9XHJcbn1cclxuIl19