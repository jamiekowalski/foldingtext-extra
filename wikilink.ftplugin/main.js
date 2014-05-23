// WikiLinks Extension for FoldingText 2.0
// By Jamie Kowalski

define(function(require, exports, module) {
    'use strict';

    var Extensions = require('ft/core/extensions').Extensions,
        wikiLinkRE = /\[\[(.*?)\]\]/g,
        wikiLinkAttr = 'wikilink',
        wikiLinkClass = 'cm-' + wikiLinkAttr,
        debug = false;
        
    function isWikiLink(e) {
        return (e != undefined && e != null && e.classList.contains(wikiLinkClass) &&
            !e.classList.contains('cm-keyword'));
    }

    // From Jesse Grosjean
    Extensions.add('com.foldingtext.taxonomy.classifier', {
        classify: function (text, state, previousState) {
            var t = text.escapedText(),
                match;
                if (t.indexOf(']]') === -1) {
                    return;
                }
                while ((match = wikiLinkRE.exec(t))) {
                    var linkText = match[0];
                    text.addAttributeInRange('keyword', '[[', match.index, 2);
                    text.addAttributeInRange(wikiLinkAttr, linkText, 
                        match.index, linkText.length);
                    text.addAttributeInRange('keyword', ']]', 
                        match.index + linkText.length - 2, 2);
                }
        },
        attributesToClear: [wikiLinkAttr]
    });
    
	Extensions.add('com.foldingtext.editor.mouse', {
    // see ft/extensions/mouse.js for more info
    
		mouseDown: function (editor, ev) {
		  if ( isWikiLink(ev.target) ) {
		    return true;  // prevent cursor from being placed
		  }/* else {
		    return false;   // maybe this causes problems, i.e. with clicking checkboxes
		  }*/
		},
    mouseUp: function (editor, ev) {
      var ele = ev.target;
      if ( isWikiLink(ele) ) {
        var t = ele.textContent;
        
        // extend wikiLink text to siblings, if necessary
        var n = ele;
        while ( isWikiLink(n.nextSibling) ) {
            n = n.nextSibling;
            t += n.textContent;
        }
        n = ele;
        while ( isWikiLink(n.previousSibling) ) {
            n = n.previousSibling;
            t = n.textContent + t;
        }
        
        // choose action based on initial char
        if (t.charAt(0) === '#') {
          t = t.substring(1);
          var path = '//"' + t + '" and @type=heading///*';
          if (debug) console.log(path);
          editor.setNodePath(path);
          editor.performCommand('scrollToBeginningOfDocument');
        } else if (t.charAt(0) === '@') {
          t = t.substring(1).trim();
          var URL = 'nv://find/' + encodeURIComponent(t);
          editor.openLink(URL);
        } else {
          var URL = 'ftwikilink://?' + encodeURIComponent(t);
          editor.openLink(URL);
        }
      }
		}
    });
});
