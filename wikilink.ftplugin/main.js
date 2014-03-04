// WikiLinks Extension for FoldingText 2.0
// By Jamie Kowalski

define(function(require, exports, module) {
    'use strict';

    var Extensions = require('ft/core/extensions'),
        wikiLinkAttr = 'wikiLink',
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
                s = t.indexOf('[['),
                e = t.indexOf(']]');
            if (s !== -1 && e !== -1 && e > s) {
                text.addAttributeInRange('keyword', '[[', s, 2);
                text.addAttributeInRange(wikiLinkAttr, t.substr(s + 2, e), s, (e + 2) - s);
                text.addAttributeInRange('keyword', ']]', e, 2);
            }
        },
        attributesToClear: [wikiLinkAttr]
    });
    
	Extensions.add('com.foldingtext.editor.mouse', {
		mouseDown: function (editor, ev) {
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
                } else if (t.charAt(0) === '@') {
                    t = t.substring(1).trim();
                    var URL = 'nv://find/' + encodeURIComponent(t);
                    window.location.assign(URL);
                } else {
                    var URL = 'ftwikilink://?' + encodeURIComponent(t);
                    window.location.assign(URL);
                }
            }
		}
    });
});
