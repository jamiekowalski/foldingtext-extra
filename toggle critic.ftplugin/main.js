/* ***************************************** *
 * Toggle Critic Plugin for FoldingText 1.3+
 * by Jamie Kowalski, github.com/jamiekowalski/foldingtext-extra
 * ***************************************** */

define(function(require, exports, module) {
	var Extensions = require('ft/core/extensions').Extensions,
        Dom = require('ft/util/dom'),
        // UserDefaults = require('ft/core/userdefaults'),  // FT 716+
        hideClass = 'hide-critic'

	Extensions.addCommand({
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
