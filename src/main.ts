import {Editor, Plugin} from 'obsidian';
import CopyVerseModal from 'src/modals/copy-verse-modal';
import LinkVerseModal, {LinkType} from './modals/link-verse-modal';
import {SettingsTab} from './settings';

export interface PluginSettings {
    // COPY
    // Functional
    verseOffset: number;
    verseHeadingLevel?: number;

    // Inserted prefixes/postfixes
    prefix: string;
    postfix: string;
    eachVersePrefix: string;
	eachVersePostfix: string;

    // Links
    linkEndVerse: boolean;
    useInvisibleLinks: boolean;
    linkOnly: boolean;

    // Output format
    newLines: boolean;
	firstLinePrefix: string;
    insertSpace: boolean;

    // Notation
    oneVerseNotation: string;
    multipleVersesNotation: string;

    // Quote (text mode) rendering & failure behavior
    quoteCallout: string;            // callout wrapper, e.g. "[!quote]"; "" drops the callout line
    verseNumberStyle: string;        // "superscript" | "plain"
    showOmissionEllipsis: boolean;   // the " … " between non-contiguous same-chapter chunks
    showChapterJumpMarker: boolean;  // the bold C:V at a same-book chapter jump
    chapterVerseSeparator: string;   // chars accepted between chapter and verse (besides legacy ",")
    insertPartialOnUnresolved: boolean; // false = abort whole quote; true = insert resolved, flag missing

    // Multiple translations
    enableMultipleTranslations: boolean;
    translationsPaths: string;
    parsedTranslationPaths: string[]; // callculated from translations paths, not shown to the user
    translationLinkingType: string;

	// Comments
	commentStart: string,
	commentEnd: string,

	// Convertors
	outputBookMapString: string,
	outputBookMap: { [key: string]: string }
	inputBookMapString: string,
	inputBookMap: { [key: string]: string }

    // LINK
    // File format
    linkSeparator: string;
    versePrefix: string;

    // Defaults
    linkTypePreset: LinkType;
    newLinePreset: boolean;

	// Format
	shouldCapitalizeBookNames: boolean;

	// Misc
	verifyFilesWhenLinking: boolean;
}

const DEFAULT_SETTINGS: Partial<PluginSettings> = {
    // COPY
    // Functional
    verseOffset: 0,
    verseHeadingLevel: undefined,

    // Inserted prefixes/postfixes
    prefix: "",
    postfix: "",
    eachVersePrefix: "",
	eachVersePostfix: "",

    // Links
    linkEndVerse: false,
    useInvisibleLinks: true,
    linkOnly: false,

    // Output format
    newLines: false,
	firstLinePrefix: "",
    insertSpace: true,

    // Notation — colon by default for standard English scripture punctuation ("Gen 1:1"); still
    // editable for anyone who prefers the legacy European "Gen 1,1" style.
    oneVerseNotation: ":",
    multipleVersesNotation: ":",

    // Quote (text mode) rendering & failure behavior
    quoteCallout: "[!quote]",
    verseNumberStyle: "superscript",
    showOmissionEllipsis: true,
    showChapterJumpMarker: true,
    chapterVerseSeparator: ":.",
    insertPartialOnUnresolved: false,

    // Multiple translations
    enableMultipleTranslations: false,
    translationsPaths: "",
    parsedTranslationPaths: [],
    translationLinkingType: "all",

	// Comments
	commentStart: "",
	commentEnd: "",

	// Convertors
	outputBookMapString: "",
	outputBookMap: {},
	inputBookMapString: "",
	inputBookMap: {},

    // LINK
    // File format
    linkSeparator: "#",
    versePrefix: "",

    // Defaults
    linkTypePreset: LinkType.Basic,
    newLinePreset: true,

	// Format
	shouldCapitalizeBookNames: true,

	// Misc
	verifyFilesWhenLinking: false,
};


function replaceSelectionOrInsertAtCursor(str: string, editor: Editor) {
	// Capture the insertion point before the edit: start of the selection if
	// there is one, otherwise the current cursor position.
	const insertionPoint = editor.getCursor("from");
	// Replace the current selection with str (or insert at cursor if nothing
	// is selected). This deletes any selected text first.
	editor.replaceSelection(str);
	// Explicitly move the cursor to the end of the inserted text using offsets
	// (preserves the original replaceRangeAndMoveCursor behavior).
	let offset = editor.posToOffset(insertionPoint);
	offset += str.length;
	editor.setCursor(editor.offsetToPos(offset));
}

export default class BibleLinkerPlugin extends Plugin {
    settings: PluginSettings;

    // Opens modal for text copying
    openCopyModal = () => {
		const editor = this.app.workspace.activeEditor?.editor
        if (editor) {
            const prefill = editor.getSelection();
            new CopyVerseModal(this.app, this.settings,
                (str) => replaceSelectionOrInsertAtCursor(str, editor),
                prefill
			).open();
        }
    }

    // Opens modal for creating obsidian links
    openObsidianLinkModal = () => {
		const editor = this.app.workspace.activeEditor?.editor
        if (editor) {
            const prefill = editor.getSelection();
            new LinkVerseModal(this.app, this.settings,
                (str) => replaceSelectionOrInsertAtCursor(str, editor),
                prefill
			).open();
        }
    }


    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    }

    async saveSettings() {
        await this.saveData(this.settings)
    }

    // Run once when plugin is loaded
    async onload() {
        // Handle settings
        await this.loadSettings();
        this.addSettingTab(new SettingsTab(this.app, this))

        // Add icon to insert link 
        // this.addRibbonIcon("link", "Insert bible link", (evt: MouseEvent) => this.openCopyModal());

        // Command to insert link (only available in editor mode)
        this.addCommand({
            id: 'insert-bible-link', // ID left to preserve user's key mappings
            name: "Copy and Link Bible verses",
            icon: "copy",
            editorCallback: this.openCopyModal
        })

        // Command to insert link (only available in editor mode)
        this.addCommand({
            id: 'insert-bible-link-obsidian-link',
            name: "Link Bible verses",
            icon: "link",
            editorCallback: this.openObsidianLinkModal
        })
    }
}
