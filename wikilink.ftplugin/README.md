# WikiLink: FoldingText Extension

Enables WikiLink syntax: `[[Link Text]]`.

Note: this extension is very experimental.

## Opening Files

When the link is clicked, the folder containing the current document will be searched, and the first matched document will be opened. Fallback folders can be specified in the script; if no match was found in the original folder, these folders will be searched successively until a match is found.

If no matching file is found in any folder, the link text will be searched within [Notational Velocity](http://notational.net) or [nvALT](http://brettterpstra.com/projects/nvalt/).

To explicitly search Notational Velocity, prefix the link text with `@`.

The link text can optionally be followed by `#` and heading text to focus in the linked document. Thus the link [[German History #Enlightenment]] will open a document matching "german history" and focus any heading containing the text "enlightenment". [Currently this does not work correctly unless the linked document is already open.]

Alternately, start the link text with `#` to focus the corresponding heading in the present document.

## File Matching Details

The file search uses case-insensitive file globbing, with each character of the search term except for word characters and `-` replaced with `*`. Folders are searched recursively (this can be disabled at the top of `wikilink_search.rb`). For example, the link `[[link text]]` will result in the glob string `folder/**/*link*text*.{extensions}`, where extensions is a list of recognized extensions (which can be customized at the top of the Ruby file).

## To Install

Download the [ZIP of this repository](https://github.com/jamiekowalski/foldingtext-extra/archive/master.zip) and move the `wikilink.ftplugin` to your FoldingText plug-ins folder (open this from FoldingText by choosing File > Open Application Folder). Restart FoldingText.

This extension will most likely fail to run at first because of the Gate Keeper security system. You can circumvent this by right-clicking on the .app, selecting “Open”; when prompted, allow the app to open. The extension should now work.

Before using, edit the settings at the top of `wikilink_search.rb`.

Requires [FoldingText 2.0](http://support.foldingtext.com/discussions/development-versions/)

## Known Issues

- When using a link with a filter parameter, an permissions error message will occasionaly show. Click the OK button, and script should continue normally.
