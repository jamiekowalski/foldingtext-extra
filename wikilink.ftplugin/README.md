# WikiLink: FoldingText Extension

Enables WikiLink syntax: `[[Link Text]]`.

When the link is clicked, the folder containing the current document will be searched, and the first matched document will be opened. The search uses file glob, with each non-word character of the search term replaced with `*`. 

Fallback folders can be specified in the script; if no match was found in the original folder, these folders will be searched successively until a match is found.

If no match is found in any folder, the text will be searched within [Notational Velocity](http://notational.net) or [nvALT](http://brettterpstra.com/projects/nvalt/).

If the link text is prefixed with `#`, clicking the link will focus the corresponding heading in the document; this allows for cross-referencing within the same document.

To explicitly search Notational Velocity, prefix the link text with `@`.

## To Install

Download the [ZIP of this repository](https://github.com/jamiekowalski/foldingtext-extra/archive/master.zip) and move the `wikilink.ftplugin` to your FoldingText plug-ins folder (open this from FoldingText by choosing File > Open Application Folder).

This extension will most likely fail to run at first because of the Gate Keeper security system. You can circumvent this by right-clicking on the .app, selecting “Open”; when prompted, allow the app to open. The extension should now work.

Requires [FoldingText 2.0](http://support.foldingtext.com/discussions/development-versions/)
