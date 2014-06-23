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
					restoredItems.isAutoScrolling = localStorage.getItem("isAutoScrolling");
					restoredItems.isFullscreen = localStorage.getItem("isFullscreen");
					restoredItems.activePanel = localStorage.getItem("activePanel");
				} catch (e) {}
			}

			c(restoredItems);
		},

		// Update the preview panel with new HTML
		updateMarkdownPreview: function(html) {
			editor.markdownPreview.html(html);

			// Update word count
			var bodyText = $('#preview').text();
		    if (bodyText.length == 0) {
		        $('#word-count').html(0);
		        return;
		    }
		    else {
		    	var wordCount = bodyText.trim().replace(/\s+/gi, ' ').split(' ').length;
		    	$('#word-count').html(addCommas(wordCount));
		    }
		}

	};

	app.init();

});

function addCommas(nStr)
{
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}