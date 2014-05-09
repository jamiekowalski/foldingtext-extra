# Custom Markup for FoldingText 2.0

By [Jamie Kowalski](github.com/jamiekowalski/foldingtext-extra)

Add custom inline markup definitions. Predefined: inline comments and highlights like so: `{this is a comment}` `|this is highlighted|`. Since these are given the attributes 'comment' and 'highlight' they can be selected in a node path with `@line:comment` and `@line:highlight` (or with `#cm` and `#hl` in my filter plugin).

Note: if using the 'toggle critic' plugin, be sure to download the latest version of that plugin for compatibility with the custom comment syntax.

Requires [FoldingText 2.0](http://support.foldingtext.com/discussions/development-versions)

## Usage

    var addMarkup = require('./custom_inline_markup.js').addMarkup; // relative path to plugin file
    addMarkup( {start:'{', end:'}', attr:'comment', syntaxAttr:'custom-keyword'} );

For each markup definition, required properties are `start` and `attr`. `attr` is used as a class (prefixed with 'cm-') for the entire span of the inline markup. `syntaxAttr` is used as a class (prefixed with 'cm-') for the start and end syntax; defaults to 'keyword'.

Use LESS to style your custom syntax. Note that you may get unexpected styling when defining syntax characters already used by FoldingText.

## Known Issues

- Syntax is also defined within code blocks.
