$(document).ready(function() {

	app = {

		// Chrome app variables
		markdownPreviewIframe: $("#preview-iframe"),
		isMarkdownPreviewIframeLoaded: false,
		markdownPreviewIframeLoadEventCallbacks: $.Callbacks(),

		init: function() {
			editor.init();
			this.initBindings();
		},

		initBindings: function() {
			$(window).on("message", function(e) {
				app.updateMarkdownPreviewIframeHeight(e.originalEvent.data);
			});

			// In the Chrome app, the preview panel requires to be in a sandboxed iframe, hence isn't loaded immediately with the rest of the document
			this.markdownPreviewIframe.on("load", function() {
				app.isMarkdownPreviewIframeLoaded = true;
				app.markdownPreviewIframeLoadEventCallbacks.fire();
			});
		},

		// Save a key/value pair in chrome.storage (either Markdown text or enabled features)
		save: function(key, value) {
			var items = {};
			items[key] = value;
			chrome.storage.local.set(items);
		},

		// Restore the editor's state from chrome.storage (saved Markdown and enabled features)
		restoreState: function(c) {
			// restoreState needs the preview panel to be loaded: if it isn't loaded when restoreState is called, call restoreState again as soon as it is
			if (!this.isMarkdownPreviewIframeLoaded) {
				this.markdownPreviewIframeLoadEventCallbacks.add(function() {
					app.restoreState(c);
				});

				return;
			}

			chrome.storage.local.get(["markdown", "isAutoScrolling", "isFullscreen", "activePanel"], c);
		},

		// Update the preview panel with new HTML
		updateMarkdownPreview: function(html) {
			this.markdownPreviewIframe[0].contentWindow.postMessage(html, "*");
		},

		updateMarkdownPreviewIframeHeight: function(height) {
			app.markdownPreviewIframe.css("height", height);
			editor.markdownPreview.trigger("updated.editor");
		}

	};

	app.init();

});