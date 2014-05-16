# Custom Markup for FoldingText 2.0

By [Jamie Kowalski](github.com/jamiekowalski/foldingtext-extra)

Note: this plugin is still experimental and has a bug where adjacent markup characters will not be matched. Will be updated soon.

Add custom inline markup definitions. Predefined: inline comments and highlights like so: `{this is a comment}` `|this is highlighted|`. These are given the attributes 'comment' and 'highlight' and can be selected in a node path with `@line:comment` and `@line:highlight` (or with `#cm` and `#hl` in my filter plugin).

Note: if using the 'toggle critic' or 'filter' plugins, be sure to download the latest version of those for compatibility with the custom comment syntax.

Requires [FoldingText 2.0](http://support.foldingtext.com/discussions/development-versions)

## Usage

    var addMarkup = require('./custom_inline_markup.js').addMarkup; // relative path to plugin file
    addMarkup({
      start: '{',
      end: '}',
      attr: 'comment',
      syntaxAttr: 'custom-keyword',
      regex: false
    });

For each markup definition, required properties are `start` and `attr`. `end` defaults to match `start`, `syntaxAttr` defaults to 'keyword', `regex` defaults to `false`. `attr` is used as a class (prefixed with 'cm-') for the entire span of the inline markup. `syntaxAttr` is used as a class (prefixed with 'cm-') for the start and end syntax. If `regex` is set to true, the `start` and `end` properties must be properly escaped. The portion used as the syntax is determined by the match groups in the regex, as follows:

- no match groups: entire regex is used as syntax.
- one match group, which *must* be located at the start of the regex: match group is used as syntax.
- two match groups (of which the first must include all characters before the second): second match group is used as syntax.
- if you need to use a group *after* the syntax group, use a nonmatching group, i.e. `(?:regex)`

These strict rules are necessary since it is impossible to get the start index of a match group in Javascript. The folling are valid regex strings: `\\(`, `(\\[)\\S`, `(\\S)(\\])`. The follow are **not** valid: `(`, `\\S(\\])` (single match group, not at start), `\w(\\S)(\\])` (two match groups, first does not include all characters before second).

Use LESS to style your custom syntax. Note that you may get unexpected styling when defining syntax characters already used by FoldingText.

## Known Issues

- Syntax is also defined within code blocks.
- If two syntax regexes match the same text, only the one defined first is considered.
