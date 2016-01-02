var app;

$(document).ready(function() {

	app = {

		// Web app variables
		supportsLocalStorage: ("localStorage" in window && window.localStorage !== null),

		init: function() {
			editor.init();
		},

		// Save a key/value pair in localStorage (either Markdown text or enabled features)
		save: function(key, value) {
			if (!this.supportsLocalStorage) return false;

			// Even if localStorage is supported, using it can still throw an exception if disabled or the quota is exceeded
			try {
				localStorage.setItem(key, value);
			} catch (e) {}
		},

		// Restore the editor's state from localStorage (saved Markdown and enabled features)
		restoreState: function(c) {
			var restoredItems = {};

			if (this.supportsLocalStorage) {
				// Even if localStorage is supported, using it can still throw an exception if disabled
				try {
					restoredItems.markdown = localStorage.getItem("markdown");
					restoredItems.isSyncScrollDisabled = localStorage.getItem("isSyncScrollDisabled");
					restoredItems.isFullscreen = localStorage.getItem("isFullscreen");
					restoredItems.activePanel = localStorage.getItem("activePanel");
					restoredItems.fontSizeFactor = localStorage.getItem("fontSizeFactor");
					restoredItems.theme = localStorage.getItem("theme");
				} catch (e) {}
			}

			c(restoredItems);
		},

		// Update the preview panel with new HTML
		updateMarkdownPreview: function(html, isAfterUserInput) {
			editor.markdownPreview.html(html);
			editor.updateWordCount(editor.markdownPreview.text());
			
			preview.onImagesLoad(function() {
				editor.triggerEditorUpdatedEvent(isAfterUserInput);
			});
		},

		scrollMarkdownPreviewCaretIntoView: (function() {
			var scrollParam = {
				ref: editor.markdownPreview[0],
				padding: 40
			};

			return function() {
				var caretPos = editor.getMarkdownSourceCaretPos();
				if (!caretPos) return;

				var caretLine = editor.getMarkdownSourceLineFromPos(caretPos),
					lineCount = editor.getMarkdownSourceLineCount();

				scrollParam.elOffsets = preview.getSourceLineOffset(caretLine, lineCount);
				scrollIntoView(scrollParam);
			};
		})(),

		// Update the font size of the source, html, and preview panels
		updateFontSize: function(cssIncrement) {
			[editor.markdownSource, $(editor.markdownHtml), editor.markdownPreview].forEach(function(el) {
				updateElFontSize(el, cssIncrement);
			});	
		},

		useTheme: function(stylesheet) {
			editor.themeSelector.setAttribute("href", stylesheet);
		}

	};

	app.init();

});