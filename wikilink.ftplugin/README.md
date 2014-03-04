# WikiLink: FoldingText Extension

Enables WikiLink syntax: `[[Link Text]]`.

If the link text is prefixed with `#`, clicking the link will focus the corresponding heading in the document; this allows for cross-referencing within the same document. If the link text is prefixed with `@`, the text will be searched within [Notational Velocity](http://notational.net) or [nvALT](http://brettterpstra.com/projects/nvalt/).

If the link is not prefixed, the folder containing the current document will be searched, and the first matched document (with extension `.ft`, `.md`, or `.txt`) will be opened. Currently, this is a strict case-insensitive substring match.

## To Install

Download the [ZIP of this repository](https://github.com/jamiekowalski/foldingtext-extra/archive/master.zip) and move the `wikilink.ftplugin` to your FoldingText plug-ins folder (open this from FoldingText by choosing File > Open Application Folder). Double-click `Handle FoldingText WikiLinks.app.zip` to unzip it, and delete the .zip file.

Requires [FoldingText 2.0](http://support.foldingtext.com/discussions/development-versions/)
