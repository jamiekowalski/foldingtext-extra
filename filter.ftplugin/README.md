# Filter: FoldingText Extension

By [Jamie Kowalski](https://github.com/jamiekowalski)

Filters a FoldingText document based on an expression given in a simple syntax. For example, the expression `;writ/fiction/@todo` will show only items tagged @todo that are under an item containing the text 'fiction' that is under an heading with the text 'writ' (including partial word matches, so ‘writing’ would be matched).

The extension can also be triggered with the keyboard shortcut Shift+Command+' (i.e. quote key). Tthis can be changed near the end of the main.js file.

If the path cannot be parsed, a message is logged to the console. (Access the console in FoldingText choosing Help > SDK Runner and clicking the gear icon in the window that opens.)

The extension can also be used with [TaskPaper 3](http://support.foldingtext.com/discussions/development-versions). In TaskPaper, `;` matches projects rather than headings.

Requires [FoldingText 2.0](http://support.foldingtext.com/discussions/development-versions) build 723 or later, or [TaskPaper 3.0](http://support.foldingtext.com/discussions/development-versions).

## To Install

Download the [ZIP of this repository](https://github.com/jamiekowalski/foldingtext-extra/archive/master.zip) and move `filter.ftplugin` and `jmk_panel.ftplugin` to your FoldingText plug-ins folder (open this from FoldingText by choosing File > Open Application Folder). Restart FoldingText.

Important: this plugin requires `jmk_panel.ftplugin`.

## Change log

- 0.3
	- jmkpanel.js now uses a constructor function and is more configurable, for ease of using it in other plugins. See the file header for details.
- 0.2
	- Dismissing the panel with `Escape` returns document view and selection to state before opening panel; this makes it easy to quickly view different queries, then return directly back to where you were. Press `Return` or click within the document to dismiss the pane and keep the newly queried view.
- 0.1
	- Initial release.

## Examples of expressions:

`@important`
: items tagged @important. Note that tag matches must be exact; `@im` will not match an item tagged `@important`. This is in contrast to text matches.

`not @done`
: items not tagged @done. Note that currently, if an item is tagged @done but has subitems, it will not be hidden.

`;misc`
: headings that contain the text 'misc'

`;misc items`
: headings that contain both 'misc' and 'items'

`;misc or items`
: headings that contain either 'misc' or 'items'

`misc/today tomorrow`
: items that contain both 'today' and 'tomorrow under an item that contains 'misc'.

`;code;fold text`
: heading that contains both 'fold' and 'text' under a heading that contains 'code'.

`yesterday today and tomorrow`
: items that contains 'yesterday' and 'today' and 'tomorrow'. When only one boolean operator is used with three or more terms, this operator is used as the default.

`yesterday or today and tomorrow`
: items that contains 'yesterday' and 'today' and 'tomorrow'. When a mix of 'and' and 'or' is used, 'or's are changed to 'and'.

any expression ending with `/`
: show descendants (descendants are always shown if the last segment in the expression is a heading)

`#cm`
: items that contain a Critic Markup command/annotation

`#hl`
: items that contain a Critic Markup highlight

`#dl` or `#del`
: items that contain a Critic Markup deletion

`#in` or `#ins`
: items that contain a Critic Markup insertion

`#em` or `#emph`
: items that contain a Markdown `em` element

`#st` or `#str` or `#strong`
: items that contain a Markdown `strong` element

`#job`
: items that have the property “job”. Properties should be added at the end of a path segment. With the following text, this query with show “John”.

    John
        job : developer

Add `/` at end to also reveal `job : developer`

`#job~dev`
: items that have the property “job” with a value containing “dev”. When using a comparison operator (e.g. `~` – see next item for more), the `#` prefix is unnecessary.

`age>30`, `age<20`, `age>=25`
: items that have the property “age” with values < 30, etc.

any expression starting or ending with `*`
: don't show ancestors

any expression starting with `/`
: use FoldingText's full XPath syntax instead of the modified syntax described here. See documentation on the [FoldingText website](http://www.foldingtext.com/sdk/nodepaths/).

## Known Issues

- If the extension is triggered, and without releasing the Command key, Command+A or Command+Z is pressed, these commands act on the editor.
- Terms containing non-word characters must be wrapped in quotes.
- Syntax characters – i.e. space, `;`, `#`, `/`, etc. – will always be recognized by such, even if wrapped in quotes.
- Cannot undo changes to text in the panel.

## Planned Features

- Use new query to combine with current view: union, intersect, or not.
- Save named queries.
- Display a list of tags when a `@` is typed.
