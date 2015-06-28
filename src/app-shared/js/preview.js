var preview;

$(document).ready(function() {
	"use strict";

	var markdownPreview = document.getElementById("preview");

	preview = {
		// Return the top and bottom offsets of the previewed DOM element(s) surrounding
		// the given source line, using the preview's mapped start and end line numbers.
		getSourceLineOffset: (function() {
			var getElAtLine = function(line) {
				return document.getElementById("line-start-"+ line);
			};

			return function(line, lineCount) {
				var topOffset, count, offsets, lookAtLine, keepLooking, lineEnd,
					el = getElAtLine(line);

				// Return top and bottom offsets of the element found at the given line
				if (el) {
					topOffset = getElRefOffset(el, "top");
					return [topOffset, topOffset + el.offsetHeight];
				}

				// Return top offset of first element found above line, and bottom offset of first element found below
				count = 0;
				offsets = [null, null];
				keepLooking = [true, true];

				do {
					count++;

					// Find element above
					if (keepLooking[0]) {
						lookAtLine = line - count;

						// Reached top of doc
						if (lookAtLine < 0) {
							offsets[0] = 0;
							keepLooking[0] = false;
						// Inspect el at line above
						} else {
							el = getElAtLine(lookAtLine);

							if (el) {
								offsets[0] = getElRefOffset(el, "top");
								keepLooking[0] = false;

								// If the element we just found spans multiple lines, no need to continue looking
								// for an element below if this element's end line is greater than the given line
								lineEnd = el.getAttribute("data-line-end");
								if (lineEnd && lineEnd >= line) {
									offsets[1] = offsets[0] + el.offsetHeight;
									keepLooking[1] = false;
								}
							}
						}
					}

					// Find element below
					if (keepLooking[1]) {
						lookAtLine = line + count;

						// Reached bottom of doc
						if (lookAtLine >= lineCount) {
							offsets[1] = markdownPreview.scrollHeight;
							keepLooking[1] = false;
						// Inspect el at line below
						} else {
							el = getElAtLine(lookAtLine);

							if (el) {
								offsets[1] = getElRefOffset(el, "top") + el.offsetHeight;
								keepLooking[1] = false;
							}
						}
					}
				} while (keepLooking[0] || keepLooking[1]);

				return offsets;
			};
		})(),

		onImagesLoad: function(c) {
			var onImageLoad,
				images = $body.find("img"),
				imageCount = images.length;

			if (!imageCount) return;

			onImageLoad = function() {
				if (--imageCount <= 0) c();
			};

			images.each(function() {
				var image = $(this);

				if (image.complete) onImageLoad();
					else image.on("load", onImageLoad);
			});
		}
	};

});