define(function(require, exports, module) {
  'use strict';
  
  var addMarkup = require('./custom_inline_markup.js').addMarkup;

  addMarkup( {start:'(\\{)[^\\-+=~>]', end:'([^\\-+=~<])(\\})', attr:'comment', 
    syntaxAttr:'custom-keyword', regex:true} );
  addMarkup( {start:'(\\|)\\S', end:'(\\S)(\\|)', attr:'highlight',
    syntaxAttr:'custom-keyword', regex:true} );

});
