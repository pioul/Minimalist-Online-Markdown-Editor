var $window = $(window);

$window.on("load", function() {
	"use strict";
	
	var body = $(document.body),

		// Post messages to the parent window
		postMessage = function(data) {
			parent.postMessage(data, "*");
		},

		// Receive messages sent to this iframe (from the parent window)
		receiveMessage = function(e) {
			var data = e.originalEvent.data;
			
			if (data.hasOwnProperty("html")) updateHtml(data.html);
			if (data.hasOwnProperty("scrollLineIntoView")) scrollLineIntoView(data.scrollLineIntoView, data.lineCount);
		},

		// Send the iframe's height to the parent window
		postHeight = function() {
			postMessage({ height: body.height() });
		},

		// Send the iframe's height and text to the parent window
		postAll = function() {
			postMessage({
				height: body.height(),
				text: body.text()
			});
		},

		updateHtml = function(html) {
			body.html(html);

			postAll();
			
			// If there are images, the height of the iframe has to be manually updated to reflect the height of the images
			// Thus, wait for all images to load, then send the actual height to the parent window
			var images = body.find("img");

			if (images.length) {
				var loadedImages = 0,

					tryPostingHeight = function() {
						if (++loadedImages >= images.length) postHeight();
					};

				images.each(function() {
					var image = $(this);
					if (image.complete) {
						tryPostingHeight();
					} else {
						image.on("load", function() {
							tryPostingHeight();
						});
					}
				});
			}
		},

		// When scrolling a line into view, the parent window is the one doing the job.
		// The iframe is only sollicited to run the numbers and post back the top and
		// bottom offsets of the element(s) surrounding the given source line, since
		// it requires access to the preview's DOM for that.
		scrollLineIntoView = function(line, lineCount) {
			var offsets = preview.getSourceLineOffset(line, lineCount);
			postMessage({ scrollMarkdownPreviewIntoViewAtOffset: offsets });
		};
	
	$window.on({
		resize: postHeight,
		message: receiveMessage,

		keydown: function(e) {
			postMessage({
				// Only post event props we care about
				keydownEventObj: {
					type: e.type,
					keyCode: e.keyCode,
					ctrlKey: e.ctrlKey,
					metaKey: e.metaKey,
					altKey: e.altKey,
					shiftKey: e.shiftKey
				}
			});

			// All keydown events from this sandboxed frame are posted to and triggered in the parent window.
			// However, the original event isn't posted, so all keydown events that are cancelled by the app
			// to prevent their default action must be cancelled by hand here too. That solution isn't DRY,
			// but it's the best one around.
			// Currently applies to: CTRL (mirrored by META) + W
			if ((e.ctrlKey || e.metaKey) && e.keyCode == 87) e.preventDefault();
		}
	});
	
	body.on("click", "a", function(e) {
		e.preventDefault();
		open($(e.target).attr("href"), "MME_external_link");
	});
	
});