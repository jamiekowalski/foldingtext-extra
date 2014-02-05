/* ***************************************** *
 * Toggle Critic Plugin for FoldingText 1.3+
 * by Jamie Kowalski, github.com/jamiekowalski/foldingtext-plugins
 * ***************************************** */

define(function(require, exports, module) {
	var Extensions = require('ft/core/extensions'),
        Dom = require('ft/util/dom'),
        // UserDefaults = require('ft/core/userdefaults'),  // FT 716+
        hideClass = 'hide-critic'

	Extensions.add('com.foldingtext.editor.commands', {
		name: 'toggle critic',
		description: 'Hide/Show Critic Markup comments and deletions',
		performCommand: function (editor) {
            // userDefaults.setStringForKey('testing', 'mykey');
            // userDefaults.stringForKey()
            Dom.toggleClass(document.body, hideClass);
            editor.refresh();
		}
	});
});
