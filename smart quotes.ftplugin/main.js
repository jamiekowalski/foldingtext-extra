define(function(require, exports, module) {
	var Extensions = require('ft/core/extensions');

    function insertSmartQuote(editor, type_arg) {
        var selectedRange = editor.getSelectedRange(),
            length = selectedRange.length(),
            quoteType = type_arg.charAt(0),
            direction = 'l',
            lsquo = '‘',
            rsquo = '’',
            ldquo = '“',
            rdquo = '”',
            quote = '';
        
        var node = selectedRange.startNode,
            attributes = node.lineAttributesAtIndex(selectedRange.startOffset),
            nodeType = node.type();
        
        if ( nodeType === 'codeblock' ||
             nodeType === 'fencedcode' ||
             nodeType === 'htmlblock' ||
             (attributes && attributes.code !== undefined) ) {
                 if (quoteType === 's') {
                     quote = "'"
                 } else if (quoteType === 'd') {
                     quote = '"'
                 } else {
                     return;
                 }
        } else {
            beforeText = selectedRange.rangeByOffsetting(-1, 
                1 - length).textInRange();
            // afterText = selectedRange.rangeByOffsetting(1, 1).textInRange();
            if (beforeText.match(/\S/)) {   // OR /[\\.,>;:?!“”‘’—\*`%\])}]/
                direction = 'r';
            }
                
            if (quoteType === 's') {
                if (direction === 'r') {
                    quote = rsquo
                } else {
                    quote = lsquo
                }
            } else if (quoteType === 'd') {
                if (direction === 'r') {
                    quote = rdquo
                } else {
                    quote = ldquo
                }
            } else {
                return;
            }
        }
        
        editor.replaceSelection(quote, 'end');
        // editor.setSelectedRange(editor.getSelectedRange().rangeByOffsetting(+1, -quote.length));
	}
    
    Extensions.add('com.foldingtext.editor.init', function(editor) {
        editor.addKeyMap({
            "Shift-'" : function(editor) {
                insertSmartQuote(editor, 'double');
            },
            "'" : function(editor) {
                insertSmartQuote(editor, 'single');
            }
        });
    });
});
