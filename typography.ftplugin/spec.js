define(function (require) {
	'use strict';

	describe('Typography', function () {
		var MarkdownTaxonomy = require('ft/taxonomy/markdowntaxonomy').MarkdownTaxonomy,
			Taxonomies = require('ft/core/taxonomies'),
			Editor = require('ft/core/editor').Editor,
			taxonomy = Taxonomies.taxonomy({
				foldingtext: true,
				multimarkdown: true,
				gitmarkdown: true,
				criticMarkup: true
			}, 'markdown'),
			editor;

		beforeEach(function () {
			editor = new Editor('', taxonomy);
		});

		afterEach(function () {
			editor.removeAndCleanupForCollection();
		});

		it('should change straight to curly quotes', function () {
			editor.setTextContent('\'single\'\n"double"\napostrophe\'s chance\n"nested \'quotes\'"');
			editor.performCommand('selectAll');
			editor.performCommand('typography');
			expect(editor.textContent()).toEqual('‘single’\n“double”\napostrophe’s chance\n“nested ‘quotes’”');
		});
        
        // the following will not currently pass
        // \n\'nested the "other way"\'
        // \n‘nested the “other way”’
	});
});
