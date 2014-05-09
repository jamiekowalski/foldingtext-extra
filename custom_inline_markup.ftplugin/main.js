define(function(require, exports, module) {
  'use strict';
  
  var addMarkup = require('./custom_inline_markup.js').addMarkup;

  addMarkup( {start:'{', end:'}', attr:'comment', syntaxAttr:'custom-keyword'} );
  addMarkup( {start:'|', attr:'highlight', syntaxAttr:'custom-keyword'} );

});
