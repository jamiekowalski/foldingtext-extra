# Smart Quotes: FoldingText Plugin

Inserts smart quotes instead of straight quotes in FoldingText documents.

In most cases, the plugin will insert the quote you want; but note that it only looks at the previous character to determine whether to insert a left- or right-quote, and makes no attempt at matching pairs.

It fails in the following cases:

“Still”—he thought—”it might be turn out all right.” (Quotation mark after dash; can't simply always use left quote, since a more common paring of dash and quote is: “That’s all well and good—”)
In ‘99
‘Twas the night before Christmas
Lots ‘n’ lots

Requires FoldingText 1.3
