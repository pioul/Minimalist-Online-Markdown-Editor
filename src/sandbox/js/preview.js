var $window = $(window);

$window.on("load", function() {
	"use strict";
	
	var body = $(document.body),

		postMessage = function(data) {
			parent.postMessage(data, "*");
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
		};
	
	$window.on({
		resize: postHeight,

		// Listen to messages coming from the parent window
		// Currently only used to transfer HTML from the parent window to the iframe for display
		message: function(e) {
			body.html(e.originalEvent.data);

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

		keydown: function(e) {
			postMessage({
				// Only post event props we care about
				keydownEventObj: {
					type: e.type,
					keyCode: e.keyCode,
					ctrlKey: e.ctrlKey,
					altKey: e.altKey,
					shiftKey: e.shiftKey
				}
			});

			// All keydown events from this sandboxed frame are posted to and triggered in the parent window.
			// However, the original event isn't posted, so all keydown events that are cancelled by the app
			// to prevent their default action must be cancelled by hand here too. That solution isn't DRY,
			// but it's the best one around.
			// Currently applies to: CTRL + W
			if (e.ctrlKey && e.keyCode == 87) e.preventDefault();
		}
	});
	
	body.on("click", "a", function(e) {
		e.preventDefault();
		open($(e.target).attr("href"), "MME_external_link");
	});
	
});