var keyCode, doesSupportInputEvent;

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
})();