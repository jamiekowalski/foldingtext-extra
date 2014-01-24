define(function(require, exports, module) {
	var Extensions = require('ft/core/extensions'),
        Dom = require('ft/util/dom'),
        // UserDefaults = require('ft/core/userdefaults'),  // FT 716+
        hideClass = 'hide-critic',
        shown = true;
    
    /*
    
    This plugin requires special CSS in user.less
    
    */

	Extensions.add('com.foldingtext.editor.commands', {
		name: 'toggle critic',
		description: 'Hide/Show Critic Markup comments and deletions',
		performCommand: function (editor) {
            // userDefaults.setStringForKey('testing', 'mykey');
            // userDefaults.stringForKey()
            
            if (shown) {
                Dom.addClass(document.body, hideClass);
                shown = false;
                editor.refresh();
            } else {
                Dom.removeClass(document.body, hideClass);
                shown = true;
                editor.refresh();
            }
		}
	});
});
