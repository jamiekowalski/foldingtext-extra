/* ***************************************** *
 * Concentrate Plugin for FoldingText 1.3+
 * by Jamie Kowalski, github.com/jamiekowalski/foldingtext-extra
 * ***************************************** */

define(function(require, exports, module) {
	var Extensions = require('ft/core/extensions'),
        Dom = require('ft/util/dom'),
        // UserDefaults = require('ft/core/userdefaults'),
        focusClass = 'jmk-concentrate'

	Extensions.add('com.foldingtext.editor.commands', {
		name: 'concentrate',
		description: 'Narrow your focus to the current sentence',
		performCommand: function (editor) {
            // userDefaults.setStringForKey('testing', 'mykey');
            // userDefaults.stringForKey()
            Dom.toggleClass(document.body, focusClass);
            editor.refresh();
		}
	});
  
  Extensions.add('com.foldingtext.editor.init', function (editor) {
    editor.addKeyMap({
      'Cmd-U' : 'concentrate'
    })
  });
});
