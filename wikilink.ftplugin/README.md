# WikiLink: FoldingText Extension

Enables WikiLink syntax: `[[Link Text]]`.

## Opening Files

When the link is clicked, the folder containing the current document will be searched, and the first matched document will be opened. Fallback folders can be specified in the script; if no match was found in the original folder, these folders will be searched successively until a match is found.

If no match is found in any folder, the link text will be searched within [Notational Velocity](http://notational.net) or [nvALT](http://brettterpstra.com/projects/nvalt/).

To explicitly search Notational Velocity, prefix the link text with `@`.

The file search uses case-insensitive file globbing, with each character of the search term except for word characters and `-` replaced with `*`. Folders are searched recursively (this can be disabled at the top of `wikilink_search.rb`). For example, the link `[[link text]]` will result in the glob string `folder/**/*link*text*.{extensions}`, where extensions is a list of recognized extensions (which can be customized at the top of the Ruby file).

## Cross-Referencing

If the link text is prefixed with `#`, clicking the link will focus the corresponding heading in the document; this allows for cross-referencing within the same document.

## To Install

Download the [ZIP of this repository](https://github.com/jamiekowalski/foldingtext-extra/archive/master.zip) and move the `wikilink.ftplugin` to your FoldingText plug-ins folder (open this from FoldingText by choosing File > Open Application Folder).

This extension will most likely fail to run at first because of the Gate Keeper security system. You can circumvent this by right-clicking on the .app, selecting “Open”; when prompted, allow the app to open. The extension should now work.

Before using, edit the settings at the top of `wikilink_search.rb`.

Requires [FoldingText 2.0](http://support.foldingtext.com/discussions/development-versions/)
