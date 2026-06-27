/*
 * The Link command's link-style modes, in their own Obsidian-free module so the pure link
 * builder (link.ts) can switch on them without importing the Obsidian-backed modal.
 */
export enum LinkType {
	Basic = "Basic",
	Embedded = "Embedded",
	Invisible = "Invisible",
	FirstAndLast = "FirstAndLast",
}
