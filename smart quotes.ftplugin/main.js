define(function(require, exports, module) {
	var Extensions = require('ft/core/extensions');

    function insertSmartQuote(editor, type_arg) {
        var selectedRange = editor.getSelectedRange(),
            length = selectedRange.length(),
            quoteType = type_arg.charAt(0),
            lsquo = '‘',
            rsquo = '’',
            ldquo = '“',
            rdquo = '”',
            quote = '';
        
        // check whether we're in a code element
        var node = selectedRange.startNode,
            attributes = node.lineAttributesAtIndex(selectedRange.startOffset),
            nodeType = node.type();
        
        if ( nodeType === 'codeblock' ||
             nodeType === 'fencedcode' ||
             nodeType === 'htmlblock' ||
             (attributes && attributes.code !== undefined) ) {
                 // we're in a code element
                 
                 if (quoteType === 's') {
                     quote = "'"
                 } else if (quoteType === 'd') {
                     quote = '"'
                 } else {
                     return;
                 }
        } else {
            // we're in normal text
            
            beforeChar = selectedRange.rangeByOffsetting(-1, 
                1 - length).textInRange();
            
            var direction = 'r';
            if (beforeChar.match(/^[\s\/[({]?$/)) {
                direction = 'l';
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
