define(function (require) {
	'use strict';

	describe('Smart Quotes', function () {
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

		it('should insert curly quotes', function () {
			// editor.setTextContent('line\n\n- one\n- two');
			// editor.performCommand('selectAll');
			// editor.performCommand('capitalize lists');
			// expect(editor.textContent()).toEqual('line\n\n- One\n- Two');
		});
	});
});