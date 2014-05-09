/* ----------------------------------------------------------------------------- *
 * Custom markup extension for FoldingText 2.0
 * by Jamie Kowalski, github.com/jamiekowalski/foldingtext-extra
 * Reuse permitted without restriction, provided this attribution is included
 * 
 * To use:
 * 
 * var addMarkup = require('./custom_inline_markup.js').addMarkup;
 * addMarkup( {start:'{', end:'}', attr:'comment', syntaxAttr:'custom-keyword'} );
 *
 * For each markup definition, required properties are 'start' and 'attr'. 
 * The attributes are used as classes, prefixed with 'cm-'
 * 
 * ----------------------------------------------------------------------------- */

define(function(require, exports, module) {
  'use strict';

  var Extensions = require('ft/core/extensions');

  // from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript  
  function regexEsc(s) {
      return s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
  };
    
  var markupDefs = [],
    clearAttributes = [],
    regexStr = '',
    regex;
  
  exports.addMarkup = function (markup) {
    if ( ! markup.start || ! markup.attr ) {
      var requiredProp = '';
      if ( ! markup.start ) {
        requiredProp = 'start';
      }
      if ( ! markup.attr ) {
        requiredProp = 'attr';
      }
      console.log("Custom markup definition: '" + requiredProp +
        "' is a required property. Ignoring markup.");
      
      return;
    }
    for (var option in markup) {
      console.log(typeof option, option instanceof String);
      if ( typeof option !== 'string' && ! (option instanceof String) ) {
        console.log("Custom markup definition: options must be of type string");
        return;
      }
    }
    
    // defaults
    markup.end = markup.end || markup.start;
    markup.syntaxAttr = markup.syntaxAttr || 'keyword';

    markup.index = -1; // initialize index

    regexStr += '|' + regexEsc(markup.start) + '|' + regexEsc(markup.end) + '|';
    clearAttributes.push(markup.attr, markup.syntaxAttr);

    markupDefs.push(markup);
    
    // remove initial and final '|' from regex
    regexStr = regexStr.replace(/^\||\|$/g, '');
    regex = new RegExp(regexStr, 'g');
  }
  
  Extensions.add('com.foldingtext.taxonomy.classifier', {
    classify: function (text, state, previousState) {
      if ( markupDefs.length < 1 ) {
        return;
      }
      
      var t = text.escapedText(),
        match;
            
      while (( match = regex.exec(t) )) {
        
        // TODO cancel classify if within a code range
        // var node = selectedRange.startNode,
        //     attributes = node.lineAttributesAtIndex(selectedRange.startOffset),
        //     nodeType = node.type();
        // 
        // if ( nodeType === 'codeblock' ||
        //    nodeType === 'fencedcode' ||
        //    nodeType === 'htmlblock' ||
        //    (attributes && attributes.code !== undefined) ) {
        //      // we're in a code element
        //      return
        // }
        
        for (var i = 0; i < markupDefs.length; i++) {
          var markup = markupDefs[i];
          
          if ( markup.index >= 0 && match[0] === markup.end ) {
            // within markup span, and end syntax just found
        
            var contentString = text.textSubstring(markup.index, match.index + markup.end.length);
            
            text.addAttributeInRange(markup.syntaxAttr, markup.start, markup.index, 
              markup.start.length);
            text.addAttributeInRange(markup.attr,
              contentString.substring(markup.start.length, contentString.length - markup.end.length), 
              markup.index, contentString.length);
            text.addAttributeInRange(markup.syntaxAttr, markup.end, 
              match.index, markup.end.length);
            
            // no longer within this syntax; reset index
            markup.index = -1;
            break; // don't consider other markups for this match
            
          } else if ( markup.index < 0 && match[0] === markup.start ) {
            // not in markup span, and start syntax just found
            
            markup.index = match.index;
            break; // don't consider other markups for this match
            
          }
          // in other cases, don't modify state of this markup parser
        }
      }
      
      // reset all indexes
      for (var i = 0; i < markupDefs.length; i++) {
        markupDefs[i].index = -1;
      }
    
    },
    attributesToClear: clearAttributes
  });
      
});
