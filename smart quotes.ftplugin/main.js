define(function(require, exports, module) {
	var Extensions = require('ft/core/extensions');

    function insertSmartQuote(editor, type_arg) {
        var selectedRange = editor.getSelectedRange();
        var length = selectedRange.length();
        var type = type_arg.charAt(0);
        var direction = 'l';
        
        // if (! selectedRange.collapsed() ) return;
        
        beforeText = selectedRange.rangeByOffsetting(-1, 1 - length).textInRange();
        // afterText = selectedRange.rangeByOffsetting(1, 1).textInRange();
        if (beforeText.match(/\S/)) {   // OR /[\\.,>;:?!“”‘’—\*`%\])}]/
            direction = 'r';
        }
        
        sq = '';          // sq for smart quote
        
        if (type === 's') {
            if (direction === 'r') {
                sq = "’"
            } else {
                sq = "‘"
            }
        } else if (type === 'd') {
            if (direction === 'r') {
                sq = '”'
            } else {
                sq = '“'
            }
        } else {
            return;
        }
        editor.replaceSelection(sq);
        editor.setSelectedRange(editor.getSelectedRange().rangeByOffsetting(+1, -sq.length));
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
