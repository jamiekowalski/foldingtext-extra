define(function(require, exports, module) {
  'use strict';

  var Extensions = require('ft/core/extensions').Extensions;
  
  // from http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
  function padInt(n, width, z) {
    z = z || '0';
    n = String(n);
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
  
  // from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  
  function insertFootnote(editor) {
    var footnoteText = prompt('Footnote text: \n');
    if (! footnoteText) {
      return;
    }
    var refPrefix = 'fn',
    numLo = 0,
    numHi = 999;
      
    var refText = '[^' + refPrefix + 
    padInt(getRandomInt(numLo, numHi), String(numHi).length) + ']';
          
    editor.replaceSelection(refText, 'end');
      
    var prevRange = editor.selectedRange();
    editor.performCommand('moveToEndOfDocument');
    var lastChar = editor.selectedRange().
    rangeByOffsetting(-1, 1 - length).textInRange();
    
    var footnoteBegin = '\n' + refText + ': ';
    if (lastChar !== '\n') {          // if no final line return in doc, add one
      footnoteBegin = '\n' + footnoteBegin;
    }
    editor.replaceSelection(footnoteBegin + footnoteText + '\n');
    
    editor.setSelectedRange(prevRange);
  }
  
  Extensions.addInit(function (editor) {
    editor.addKeyMap({
    'Shift-Cmd-F' : function(editor) {
      insertFootnote(editor)
    }
    });
  });

});
