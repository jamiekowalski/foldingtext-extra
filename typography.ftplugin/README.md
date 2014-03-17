# Improve Typography: FoldingText Plugin

By [Jamie Kowalski](https://github.com/jamiekowalski)

Adds command `typography`, which transforms selected text in the following ways:

- Smartens quotes
- Changes -- to —
- Changes 117-29 to 117–29 (but will not modify dates in form 2014-02-27)

Ellipses may be added in the future.

Quotation mark style can be changed with the `lang` variable in the main.js file. Includes support for 'en', 'de', 'degu' (German-style guillemets), and 'fr'.

Requires [FoldingText 1.3](http://support.foldingtext.com/discussions/development-versions/)

## Known Issues

Smart quotes fail in the following instance:

> ‘She called her sister “Sam”‘ [double quote nested immediately before single quote]
