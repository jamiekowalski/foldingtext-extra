/* ***************************************** *
 * Smart Quotes Plugin for FoldingText 1.3+
 * by Jamie Kowalski, github.com/jamiekowalski/foldingtext-extra
 * ***************************************** */

define(function(require, exports, module) {

    var SmartQuotes = {};
    var sq = SmartQuotes;
    
    sq.language = 'en';  // 'en', 'de', 'degu', 'fr', 'frsp'
    sq.keyboard = 'en';  // 'en', 'de', 'ru'
    sq.enabled = true;
    sq.changeLanguageCmdEnabled = true;
    sq.changeKeyboardCmdEnabled = true;
    sq.toggleCmdEnabled = true;
    // sq.currentLanguage;
    // sq.currentKeyboard;
    
    sq.glyphSets = {
        en: { ls: '‘', rs: '’', ld: '“', rd: '”', desc: 'English'},
        de: { ls: '‚', rs: '‘', ld: '„', rd: '“', desc: 'German'},
        degu: { ls: '›', rs: '‹', ld: '»', rd: '«', desc: 'German guillemets' },
        fr: { ls: '‹', rs: '›', ld: '«', rd: '»', desc: 'French' },
        frsp: { ls: '‹ ', rs: ' ›', ld: '« ', rd: ' »', desc: 'French with spaces' }
    }
    sq.shortcutSets = {
        en: { s: "'", d: "Shift-'" , desc: 'English'},
        de: { s: "Shift-3", d: "Shift-'", desc: 'German' },
        ru: { s: "Shift-3", d: "Shift-'", desc: 'Russian' },
        decu: { s: "Alt-'", d: 'Shift-Alt-\'', desc: 'German Custom' },
        // Codemirror keymaps are difficult with non-US keyboards
        
        /* Info about keyboard shortcuts
         * from http://codemirror.net/doc/manual.html#keymaps
         * 
         * Examples of names defined here are Enter, F5, and Q. These can be 
         * prefixed with Shift-, Cmd-, Ctrl-, and Alt- (in that order!) to 
         * specify a modifier. So for example, Shift-Ctrl-Space would be a valid
         * key identifier.
         */
        
    }

  	var Extensions = require('ft/core/extensions').Extensions;

    function defineSmartQuotes(editor, lang, kb) {
        var sq = SmartQuotes,
            keyMap = {},
            language,
            keyboard,
            glyphSet,
            shortcuts
        
        if (lang && sq.glyphSets[lang]) {
            language = lang;
            sq.language = lang;
        } else  {
            language = sq.language;
        }
        
        if (kb && sq.shortcutSets[kb]) {
            keyboard = kb;
            sq.keyboard = kb;
        } else {
            keyboard = sq.keyboard;
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
        var selectedRange = editor.selectedRange(),
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
            
            // setup to use opening quote when prev is opening of different type,
            // i.e. “‘, ‘“
            var prevDifferentOpenQuote;
            if (quoteType === 's') {
                prevDifferentOpenQuote = qGlyphs.ld;
            } else {
                prevDifferentOpenQuote = qGlyphs.ls;
            }
            
            var prevCharMatch = new RegExp('^[\\s\\/[({' + prevDifferentOpenQuote + 
                ']?$'); // TODO don't match empty?
            
            if (selectedRange.startOffset === 0) {
                // at beginning of document
                direction = 'l';
            } else {
                prevChar = selectedRange.rangeByOffsetting(-1, 
                    1 - length).textInRange();
                direction = 'r';
                if (prevChar.match(prevCharMatch)) {
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
    
    Extensions.addInit(function(editor) {        
        defineSmartQuotes(editor) // no additional args: use defaults
    });
    
    if (sq.changeLanguageCmdEnabled) {
    	Extensions.add('com.foldingtext.editor.commands', {
    		name: 'smart quotes language',
    		description: 'Change language for smart quotes',
    		performCommand: function (editor) {
                var gs = SmartQuotes.glyphSets
                var promptStr = 'Set language using one of the following codes:\n'
                for (var lang in gs) {
                    promptStr += lang + ' - ' + gs[lang].ld + gs[lang].desc + 
                        gs[lang].rd + '\n'
                }
                promptStr = promptStr.trim()
            
                var lang = prompt(promptStr)
                if (lang) {
                    defineSmartQuotes(editor, lang, null);
                }
    		}
    	});
    }
    
    if (sq.changeKeyboardCmdEnabled) {
    	Extensions.add('com.foldingtext.editor.commands', {
    		name: 'smart quotes keyboard',
    		description: 'Change keyboard shortcuts for smart quotes',
    		performCommand: function (editor) {            
                var ks = SmartQuotes.shortcutSets;
                var promptStr = 'Set keyboard using one of the following codes:\n';
                for (var kb in ks) {
                    promptStr += kb + ' - ' + ks[kb].desc + '\n'
                }
                promptStr = promptStr.trim();
            
                var keyboard = prompt(promptStr)
                if (keyboard) {
                    defineSmartQuotes(editor, null, keyboard);
                }
    		}
    	});
    }

    if (sq.toggleCmdEnabled) {
    	Extensions.add('com.foldingtext.editor.commands', {
    		name: 'smart quotes toggle',
    		description: 'Toggle smart quotes on and off',
    		performCommand: function (editor) {
                var sq = SmartQuotes;
                // TODO add support for UserDefaults
                if (sq.enabled) {
                    editor.removeKeyMap(sq.keyMap.name);
                    sq.enabled = false;
                } else {
                    editor.addKeyMap(sq.keyMap);
                    sq.enabled = true;
                }
    		}
    	});
    }
});
