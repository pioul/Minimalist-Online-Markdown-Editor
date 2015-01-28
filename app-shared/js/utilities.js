var keyCode, doesSupportInputEvent, scrollIntoView, getElRefOffset, escapeHtml;

(function() {
	"use strict";

	keyCode = {
		TAB: 9,
		ESCAPE: 27
	};

	doesSupportInputEvent = (function() {
		var doesSupport = "oninput" in document.createElement("textarea");

		if (doesSupport && navigator.userAgent.indexOf("MSIE 9.0") != -1) doesSupport = false; // IE 9 supports the input event, but has a buggy implementation that makes it useless in that project

		return doesSupport;
	})();

	if (!String.prototype.trim) String.prototype.trim = function() { return $.trim(this) };

	// Scroll elements into view, horizontally or vertically, when Element.scrollIntoView()
	// doesn't do exactly what we want (e.g., it doesn't always make an el entirely visible
	// if it already partly is).
	//
	// Takes parameters as an object:
	// - Mandatory:
	//   - el: the element to scroll into view (can optionally be replaced with
	//     param.offsets if these numbers are already known)
	//   - ref: the reference element (i.e., the one with the scrollbar) (must be
	//     a valid offset parent – body, table, th, td, or any positioned parent – when
	//     param.el isn't replaced with param.offsets)
	// - Optional:
	//   - axis: "horizontal" or "vertical" (default)
	//   - padding: padding to be left around param.el after scrolling (default: 0)
	scrollIntoView = (function() {
		var scrollIntoView = function(ref, axis, elOffsets, elSize, padding) {
			var refScrollPos, diff,
				scrollPosPropName = (axis == "vertical")? "scrollTop" : "scrollLeft",
				refSize = (axis == "vertical")? ref.offsetHeight : ref.offsetWidth,
				elOuterSize = elSize + padding * 2;

			// Too large to fit in the ref? Position it so as to fill the ref
			if (elOuterSize > refSize) {
				ref[scrollPosPropName] = elOffsets[0] + (elOuterSize - refSize) / 2;
				return;
			}

			refScrollPos = ref[scrollPosPropName];

			// Align to top/left?
			diff = refScrollPos - elOffsets[0] + padding;
			if (diff > 0) {
				ref[scrollPosPropName] -= diff;
				return;
			}

			// Or align to bottom/right?
			diff = elOffsets[1] - (refScrollPos + refSize) + padding;
			if (diff > 0) ref[scrollPosPropName] += diff;

			// Or do nothing
		};

		return function(param) {
			param.padding = param.padding || 0;
			param.axis = (param.axis == "horizontal")? "horizontal" : "vertical";

			var firstOffset;

			if (param.el) {
				param.elSize = (param.axis == "vertical")? param.el.offsetHeight : param.el.offsetWidth;

				firstOffset = getElRefOffset(param.el, (param.axis == "vertical")? "top" : "left", param.ref);
				param.elOffsets = [firstOffset, firstOffset + param.elSize];
			} else {
				// If param.el not set, param.elOffsets shoud be set instead
				param.elSize = param.elOffsets[1] - param.elOffsets[0];
			}
			
			scrollIntoView(param.ref, param.axis, param.elOffsets, param.elSize, param.padding);
		};
	})();

	// Get element offset relative to the reference offset parent (defaults to document.body)
	//
	// Browser compatibility: in IE and Webkit browsers, `position: fixed` elements have a null offsetParent
	// (source: http://www.quirksmode.org/dom/w3c_cssom.html#t33).
	// For this inconsistency to not matter, follow these two rules:
	//   - Don't measure the offset of a `position: fixed` element
	//   - And when you do, make sure the element's offset parents (document.body, and any positioned parent)
	//     aren't offset in the measured direction
	getElRefOffset = function(el, dir, ref) {
		var offsetPosMethodName = (dir != "left")? "offsetTop" : "offsetLeft",
			offset = el[offsetPosMethodName];

		if (!ref) ref = document.body;

		while ((el = el.offsetParent) != ref) {
			offset += el[offsetPosMethodName];
		}

		return offset;
	};

	escapeHtml = (function() {
		var matchingChars = /[&<>"']/g,

			charMap = {
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				"\"": "&#34;",
				"'": "&#39;"
			},

			replaceCallback = function(char) {
				return charMap[char];
			};

		return function(str) {
			return str.replace(matchingChars, replaceCallback);
		};
	})();
})();