define(function(require, exports, module) {
    'use strict';
    
	var Extensions = require('ft/core/extensions');

	Extensions.add('com.foldingtext.editor.commands', {
		name: 'typography',
		description: 'Smarten quotes, etc.',
		performCommand: function (editor) {
            var lang = 'en',
                text,
                d_open_regex,
                apos,
                s_open,
                s_close,
                d_open,
                d_close;
                        
            if (lang === 'de') {          // German, reverse commas
                apos = '’'
                s_open = '‚'
                s_close = '‘'
                d_open = '„'
                d_close = '“'
            } else if (lang === 'degu') {  // German, guillemets
                apos = '’'
                s_open = '›'
                s_close = '‹'
                d_open = '»'
                d_close = '«'
            } else if (lang === 'fr') {  // French
                apos = '’'
                s_open = '‹'
                s_close = '›'
                d_open = '«'
                d_close = '»'
            } else {                       // Default, English
                apos = '’'
                s_open = '‘'
                s_close = '’'
                d_open = '“'
                d_close = '”'
            }
            
			var text = editor.selectedText();
            
            // FIXME the following fails for the case:
            // 'She said "hello"' (double nested immediately before single)
            text = text.replace(/(^|[-–—\s\"\(\[{])'/g, '$1' + s_open);
            text = text.replace(/'(\w)/g, apos + '$1');
            text = text.replace(/'/g, s_close);
            d_open_regex = new RegExp('(^|[-–—\\/' + s_open + '\\s\\[\\({])"', 'g');
            text = text.replace(d_open_regex, '$1' + d_open);
            text = text.replace(/"/g, d_close);
            
            text = text.replace(/([^\-]|^)--([^\-]|$)/g, '$1—$2');    // em dashes
            // en dashes between numbers; don't change yyyy-mm-dd date format:
            text = text.replace(/([^\-\d]|^)(\d+)-(\d+)([^\-\d]|$)/g, '$1$2–$3$4');
            
			editor.replaceSelection(text);
		}
	});
});
