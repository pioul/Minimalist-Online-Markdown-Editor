// Markdown-it plugin intended to be used in the browser only – it doesn't have all the Browserify cruft,
// but follows the same browser conventions.

// Extend renderer rules to map source lines
window.markdownitMapLines = function(mdit) {
	"use strict";

	mdit.renderer.rules.paragraph_open = function(tokens, idx) {
		if (tokens[idx].lines) {
			return "<p id=\"line-start-"+ tokens[idx].lines[0] +"\" data-line-end=\""+ tokens[idx].lines[1] +"\">";
		}
		
		return "<p>";
	};

	mdit.renderer.rules.heading_open = function(tokens, idx) {
		if (tokens[idx].lines) {
			return "<h"+ tokens[idx].hLevel +" id=\"line-start-"+ tokens[idx].lines[0] +"\" data-line-end=\""+ tokens[idx].lines[1] +"\">";
		}

		return "<h"+ tokens[idx].hLevel +">";
	};

	mdit.renderer.rules.hr = function(tokens, idx) {
		if (tokens[idx].lines) {
			return "<hr id=\"line-start-"+ tokens[idx].lines[0] +"\" data-line-end=\""+ tokens[idx].lines[1] +"\" />\n";
		}

		return "<hr />\n";
	};

	mdit.renderer.rules.code_block = function(tokens, idx) {
		if (tokens[idx].lines) {
			return 	"<pre id=\"line-start-"+ tokens[idx].lines[0] +"\" data-line-end=\""+ tokens[idx].lines[1] +"\">"+
						"<code>"+ escapeHtml(tokens[idx].content) +"</code>"+
					"</pre>\n";
		}

		return "<pre><code>"+ escapeHtml(tokens[idx].content) +"</code></pre>\n";
	};

	mdit.renderer.rules.fence = mdit.renderer.rules.code_block;

	mdit.renderer.rules.tr_open = function(tokens, idx) {
		if (tokens[idx].lines) {
			return "<tr id=\"line-start-"+ tokens[idx].lines[0] +"\" data-line-end=\""+ tokens[idx].lines[1] +"\">";
		}

		return "<tr>";
	};
};