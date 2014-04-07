define(function(require, exports, module) {
  'use strict'

	var Extensions = require('ft/core/extensions');

  Extensions.add('com.foldingtext.editor.renderNodeElementStyles', function (editor, node, elementRenderer) {
    if (node.type() === 'blockquote') {
      elementRenderer.setStyle('marginLeft', (editor.pageMarginWidth() + 1) + 'px');
    }
  });

});
