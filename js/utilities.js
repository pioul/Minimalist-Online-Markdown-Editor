var escapeHTML, Modal, confirm, normalizeNewlines;

(function() {
	"use strict";

	escapeHTML = (function() {
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
			return String(str).replace(matchingChars, replaceCallback);
		};
	})();

	// Extend the keyCode constants with values only needed in this app
	$.extend(keyCode, {
		N: 78,
		O: 79,
		S: 83,
		W: 87
	});

	Modal = (function() {
		var generateModalMarkup = function(content, buttons) {
				return [
					"<div class=\"modal-container\" style=\"display: none\">",
						"<div class=\"modal\">",
							"<div class=\"content\">"+ content +"</div>",
							(buttons? "<div class=\"buttons clearfix\">"+ buttons +"</div>" : ""),
						"</div>",
					"</div>"
				].join("");
			},

			openModals = [],

			closeLastOpenModal = function() {
				if (openModals.length) {
					openModals[openModals.length - 1].close();
					return true;
				}

				return false;
			},

			initBindings = function() {
				$document.on("keydown.modal", function(e) {
					if (e.keyCode == keyCode.ESCAPE) {
						var didCloseAModal = closeLastOpenModal();
						if (didCloseAModal) e.stopImmediatePropagation(); // If pressing ESC resulted in a modal being closed, don't propagate the event (we don't want something else to happen in addition to closing the modal). And yes, that variable is only here to make the code more legible. Yes, in addition to this comment. Yes.
					}
				});
			};

		var Modal = function(options) {
			var modal = this;
			modal.el = $(generateModalMarkup(options.content, options.buttons)).appendTo(editor.body);

			if (typeof options.onInit == "function") setTimeout(function() { options.onInit.call(modal) });
		};

		Modal.prototype.show = function() {
			this.el.show();
			openModals.push(this);
		};

		Modal.prototype.close = function() {
			this.el.trigger("close.modal").remove();
			openModals.splice(openModals.length - 1, 1);
			// [todo] force gc
		};

		// Used to enforce the fact that modals are blocking: event handlers that aren't "blocked/disabled" by the modals' transparent overlay
		// should go through this method before getting executed to make sure they're not executed while a modal is open (e.g., keyboard shortcuts handlers).
		Modal.ifNoModalOpen = function() {
			return openModals.length? Promise.reject() : Promise.resolve();
		};

		initBindings();

		return Modal;
	})();

	confirm = function(text, isTernaryChoice) {
		return new Promise(function(resolvePromise, rejectPromise) {
			rejectPromise = rejectPromise.bind(null, confirm.REJECTION_MSG);

			var buttons = isTernaryChoice?
					"<a href=\"#\" class=\"button button-primary\" data-action=\"confirm\" data-value=\"yes\">Yes</a><a href=\"#\" class=\"button button-primary\" data-action=\"confirm\" data-value=\"no\">No</a><a href=\"#\" class=\"button\" data-action=\"cancel\">Cancel</a>":
					"<a href=\"#\" class=\"button button-primary\" data-action=\"confirm\">Ok</a><a href=\"#\" class=\"button\" data-action=\"cancel\">Cancel</a>",

				modal = new Modal({
					content: text,
					buttons: buttons,

					onInit: function() {
						var modal = this,
							buttons = modal.el.find(".buttons .button");

						modal.el.on("close.modal", function() { rejectPromise() });

						buttons.filter("[data-action=\"cancel\"]").on("click", function(e) {
							e.preventDefault();
							rejectPromise();
							modal.close();
						});

						buttons.filter("[data-action=\"confirm\"]")
							.on("click", function(e) {
								e.preventDefault();
								resolvePromise($(e.target).data("value"));
								modal.close();
							})
							.first().focus();
					}
				});

			modal.show();
		});
	};

	confirm.TERNARY_CHOICE = true; // Use as confirm() second param
	confirm.REJECTION_MSG = "User closed confirm modal.";

	// The editor regularly compares files' contents to detect changes, and different line break format will mess with the result.
	// Chrome (and all browsers) already normalize line breaks as LF characters inside a form element's API value (which is 
	// W3C lingo for "an element's `value` IDL attribute") (see http://www.w3.org/TR/html5/forms.html#attr-textarea-wrap). Hence,
	// normalizing line breaks in text that doesn't get through that native normalization (text that doesn't get in and out
	// the editor's textarea) seems like the sanest way to go.
	normalizeNewlines = function(str) {
		return String(str).replace(/\r/g, "");
	};

	// Since promises swallow uncaught errors and rejections, another way had to be found to keep an eye on them: .done()
	// When using promises, you should *always* either return the promise (to continue chaining), or end the chain with .done()
	// .done()'s sole purpose is to (re)throw errors for any uncaught error or rejection. It doesn't return anything so that you can only use it to end a chain.
	// It's a temporary failsafe while the spec keeps evolving, hopefully in a way that solves this issue in the first place, like Mozilla has done with Promise.jsm.
	// Make sure to throw errors and reject promises with Error objects to get a stack trace.
	// One issue with this implementation is that keeping track of chaining can be become hard when storing promises inside variables to pick up chaining somewhere 
	// else. You'll have to make the effort to keep track of that and end all chains with .done() nonetheless. Mozilla's approach is superior in that it hooks to GC to 
	// keep track of promises even outside of a chain, but you need access to the innards of a browser for that.
	// One other implementation idea would be to create a wrapper around promises in the form of a regular object with isResolved and isRejected properties, intarnally 
	// updated by the wrapper's .then() and .catch() methods. That'd allow to Object.observe() these changes and keep an eye on all promises without boilerplate method 
	// like .done() and without access to the browser's internals.
	Promise.prototype.done = function() {
		this.catch(function(e) {
			console.error("Uncaught error or rejection inside Promise", e);
		});
	};
})();