# Smart Quotes: FoldingText Plugin

By [Jamie Kowalski](https://github.com/jamiekowalski)

Inserts smart quotes instead of straight quotes in FoldingText documents.

Includes support for the following quotation styles:

“English”  
„German“  
»German Guillemets«  
«French»  
« French with spaces » (automatically inserts a non-breaking space)

Also includes some support for non-US keyboard layouts: German and Russian layouts use Shift-2 and Shift-3 for quotes. The way CodeMirror allows defining keyboard shortcuts makes it difficult to assign shortcuts for non-US keyboards.

Set the default language and keyboard in the script (look for the text `sq.defaultLanguage = 'en'` near the top). This plugin adds two commands: `smart quotes change language` that allows you to choose a new style of quotation marks without editing the script. Use the following codes (corresponding to the styles listed above): `en` `de` `degu` `fr` `frsp`. `smart quotes toggle` allows you to turn off smart quotes.

To install, add the folder `smart quotes.ftplugin` to your FoldingText plugins folder (find this from the FoldingText app by choosing `File > Open Application Folder`). Quit and re-open FoldingText.

Requires [FoldingText 2.0](http://support.foldingtext.com/discussions/development-versions)

## Known Issues

In most cases, the plugin will insert the quote you want, but since it only looks at the previous character to determine whether to insert a left- or right-quote (and makes no attempt to match pairs), it will fail in the following cases:

> “Still”—he thought—”it might turn out all right.” [Quotation mark after dash; can't simply always use left quote, since a more common paring of dash and quote is: “That’s all well and good—”]   
In ‘99   
‘Twas the night before Christmas   
Lots ‘n’ lots

Note also that the plugin cannot distinguish between single closing quotation marks and apostrophes in languages (e.g. German) in which the two are different. In that case, apostrophes must be entered manually.
