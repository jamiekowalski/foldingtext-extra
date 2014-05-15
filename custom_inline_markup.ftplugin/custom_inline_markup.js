/* ----------------------------------------------------------------------------- *
 * Custom markup extension for FoldingText 2.0
 * by Jamie Kowalski, github.com/jamiekowalski/foldingtext-extra
 * Reuse permitted without restriction, provided this attribution is included
 * 
 * To use:
 * 
 * var addMarkup = require('./custom_inline_markup.js').addMarkup;
 * addMarkup({
 *   start: '{',
 *   end: '}',
 *   attr: 'comment',
 *   syntaxAttr: 'custom-keyword',
 *   regex: false
 * });
 *
 * For each markup definition, required properties are 'start' and 'attr'. 'end' 
 * defaults to match 'start', 'syntaxAttr' defaults to 'keyword', 'regex' defaults to
 * false. The attributes are used as classes, prefixed with 'cm-'
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
      if ( typeof option !== 'string' && ! (option instanceof String) ) {
        console.log("Custom markup definition: options must be of type string");
        return;
      }
    }
    
    // defaults
    markup.end = markup.end || markup.start;
    markup.syntaxAttr = markup.syntaxAttr || 'keyword';

    markup.index = -1; // initialize index

    if (! markup.regex) {
      markup.start = regexEsc(markup.start);
      markup.end = regexEsc(markup.end);
    }
    regexStr += '|' + markup.start + '|' + markup.end + '|';
    
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
          
          var startMatch = match[0].match(markup.start);
          var endMatch = match[0].match(markup.end);
          
          if ( markup.index >= 0 && endMatch) {
            // within markup span, and end syntax just found
      
            var start;
            var end;
            var startIndex = markup.index;
            var endIndex = match.index;
            
            if (markup.regex) {
              if ( markup.startMatch[2] ) {
                start = markup.startMatch[2];
                startIndex += markup.startMatch[1].length;
              } else if ( markup.startMatch[1] ) {
                start = markup.startMatch[1];
              } else {
                start = markup.startMatch[0];
              }
              
              if ( endMatch[2] ) {
                end = endMatch[2];
                endIndex += endMatch[1].length;
              } else if ( endMatch[1] ) {                
                end = endMatch[1];
              } else {
                end = endMatch[0];
              }
            } else {
              start = markup.start;
              end = markup.end;
            }
        
            var contentString = text.textSubstring(startIndex, endIndex + end.length);
            
            text.addAttributeInRange(markup.syntaxAttr, start, startIndex, 
              start.length);
            text.addAttributeInRange(markup.attr,
              contentString.substring(start.length, contentString.length - end.length), 
              startIndex, contentString.length);
            text.addAttributeInRange(markup.syntaxAttr, end, 
              endIndex, end.length);
            
            // no longer within this syntax; reset index
            markup.index = -1;
            break; // don't consider other markups for this match
            
          } else if ( markup.index < 0 && startMatch ) {
            // not in markup span, and start syntax just found
            
            markup.index = match.index;
            markup.startMatch = startMatch;
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
