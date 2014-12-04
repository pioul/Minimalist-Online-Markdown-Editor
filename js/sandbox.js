$(window).on("load", function() {
	"use strict";
	
	var body = $(document.body),

		postMessage = function(data) {
			window.parent.postMessage(data, "*");
		},

		// Send the iframe's height to the parent window
		postHeight = function() {
			postMessage({ height: body.height() });
		},

		// Send the iframe's height and text to the parent window
		postResponse = function() {
			postMessage({
				height: body.height(),
				text: body.text()
			});
		};
	
	$(window).on({
		resize: postHeight,

		// Listen to messages coming from the parent window
		// Currently only used to transfer HTML from the parent window to the iframe for display
		message: function(e) {
			body.html(e.originalEvent.data);

			postResponse();
			
			// If there are images, the height of the iframe has to be manually updated to reflect the height of the images
			// Thus, wait for all images to load, then send the actual height to the parent window
			var images = body.find("img");
			if (images.length) {
				var loadedImages = 0,
					incrementLoadedImages = function() {
						if (++loadedImages >= images.length) postHeight();
					};
				images.each(function() {
					var image = $(this);
					if (image.complete) {
						incrementLoadedImages();
					} else {
						image.on("load", function() {
							incrementLoadedImages();
						});
					}
				});
			}
			
		}
	});
	
	body.on("click", "a", function(e) {
		e.preventDefault();
		open($(e.target).attr("href"), "MME_external_link");
	});
	
});