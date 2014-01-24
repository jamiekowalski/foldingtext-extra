define(function(require, exports, module) {

    if (! window.co) window.co = {}; if (! co.jamiekowalski) co.jamiekowalski = {}
    if (! co.jamiekowalski.SmartQuotes) co.jamiekowalski.SmartQuotes = {}
    var sq = co.jamiekowalski.SmartQuotes;
    
    sq.defaultLanguage = 'en';  // 'en', 'de', 'degu', 'fr', 'frsp'
    sq.defaultKeyboard = 'en';  // 'en', 'de', 'ru'
    sq.enabled = true;
    
    sq.glyphSets = {
        en: { ls: '‘', rs: '’', ld: '“', rd: '”', desc: 'English'},
        de: { ls: '‚', rs: '‘', ld: '„', rd: '“', desc: 'German'},
        degu: { ls: '›', rs: '‹', ld: '»', rd: '«', desc: 'German guillemets' },
        fr: { ls: '‹', rs: '›', ld: '«', rd: '»', desc: 'French' },
        frsp: { ls: '‹ ', rs: ' ›', ld: '« ', rd: ' »', desc: 'French with spaces' }
    }
    sq.shortcutSets = {
        en: { s: "'", d: "Shift-'" },
        de: { s: "Shift-3", d: "Shift-'" },
        ru: { s: "Shift-3", d: "Shift-'" }
        // Codemirror keymaps are difficult with non-US keyboards
    }

	var Extensions = require('ft/core/extensions');

    function defineSmartQuotes(editor, lang, kb) {
        var sq = co.jamiekowalski.SmartQuotes,
            keyMap = {},
            language,
            keyboard,
            glyphSet,
            shortcuts
        
        if (lang && sq.glyphSets[lang]) {
            language = lang
        } else {
            language = sq.defaultLanguage
        }
        
        if (kb && sq.shortcutSets[kb]) {
            keyboard = kb
        } else {
            keyboard = sq.defaultKeyboard
        }
        
        glyphSet = sq.glyphSets[language]
        shortcuts = sq.shortcutSets[keyboard]
        
        keyMap.name = keyboard
        keyMap[shortcuts.s] = function(editor) {
                insertSmartQuote(editor, 's', glyphSet);
        };
        keyMap[shortcuts.d] = function(editor) {
                insertSmartQuote(editor, 'd', glyphSet);
        }
        
        if (sq.keyMap) {
            editor.removeKeyMap(sq.keyMap.name);
        }
        sq.keyMap = keyMap;
        if (sq.enabled) {
            editor.addKeyMap(keyMap);
        }
    }

    function insertSmartQuote(editor, type_arg, qGlyphs) {
        var selectedRange = editor.getSelectedRange(),
            length = selectedRange.length(),
            quoteType = type_arg.charAt(0),
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
            var direction;
            
            if (selectedRange.startOffset === 0) {
                // at beginning of document
                direction = 'l';
            } else {
                beforeChar = selectedRange.rangeByOffsetting(-1, 
                    1 - length).textInRange();
                direction = 'r';
                if (beforeChar.match(/^[\s\/[({]?$/)) {
                    direction = 'l';
                }
            }
            
            if (quoteType === 's') {
                if (direction === 'r') {
                    quote = qGlyphs.rs
                } else {
                    quote = qGlyphs.ls
                }
            } else if (quoteType === 'd') {
                if (direction === 'r') {
                    quote = qGlyphs.rd
                } else {
                    quote = qGlyphs.ld
                }
            } else {
                return;
            }
        }
        
        editor.replaceSelection(quote, 'end');
	}
    
    Extensions.add('com.foldingtext.editor.init', function(editor) {        
        defineSmartQuotes(editor) // no additional args: use defaults
    });
    
	Extensions.add('com.foldingtext.editor.commands', {
		name: 'smart quotes language',
		description: 'Change language for smart quotes',
		performCommand: function (editor) {
            var gs = co.jamiekowalski.SmartQuotes.glyphSets
            var promptStr = 'Set language using one of the following codes:\n\n'
            for (var lang in gs) {
                promptStr += lang + ' - ' + gs[lang].ld + gs[lang].desc + 
                    gs[lang].rd + '\n'
            }
            promptStr = promptStr.trim()
            
            var lang = prompt(promptStr)
            if (lang) {
                defineSmartQuotes(editor, lang, 'en');
            }
		}
	});
    
	Extensions.add('com.foldingtext.editor.commands', {
		name: 'smart quotes toggle',
		description: 'Toggle smart quotes on and off',
		performCommand: function (editor) {
            var sq = co.jamiekowalski.SmartQuotes;
            if (sq.enabled) {
                editor.removeKeyMap(sq.keyMap.name);
                sq.enabled = false;
            } else {
                editor.addKeyMap(sq.keyMap);
                sq.enabled = true;
            }
		}
	});
});
