# Custom Markup for FoldingText 2.0

By [Jamie Kowalski](github.com/jamiekowalski/foldingtext-extra)

Add custom inline markup definitions. Predefined: `{}` for inline comment and || for inline highlight. Since these are given the attributes 'comment' and 'highlight', respectively, they can be selected as such in a node path (and with `#cm` and `#hl` in my filter plugin).

Requires [FoldingText 2.0](http://support.foldingtext.com/discussions/development-versions)

Note: if using the 'toggle critic' plugin, be sure to download the latest version for compatibility with the custom comment syntax.

## Usage

    var addMarkup = require('./custom_inline.js').addMarkup;
    addMarkup( {start:'{', end:'}', attr:'comment', syntaxAttr:'custom-keyword'} );

For each markup definition, required properties are `start` and `attr`. `attr` is used as a class (prefixed with 'cm-') for the entire span of the inline markup. `syntaxAttr` is used as a class (prefixed with 'cm-') for the start and end syntax; defaults to 'keyword'.

Use LESS to style your custom syntax. Note that you may get unexpected styling when defining syntax characters already used by FoldingText.

## Known Issues

- Syntax is also defined within code blocks.
