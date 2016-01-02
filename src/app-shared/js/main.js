var editor,
	$window = $(window);

$document.ready(function() {
	"use strict";

	var buttonsContainers = $(".buttons-container");
	
	editor = {
		
		// Editor variables
		fitHeightElements: $(".full-height"),
		wrappersMargin: $("#left-column > .wrapper:first").outerHeight(true) - $("#left-column > .wrapper:first").height(),
		previewMarkdownConverter: window.markdownit({ html: true }).use(window.markdownitMapLines),
		cleanHtmlMarkdownConverter: window.markdownit({ html: true }),
		columns: $("#left-column, #right-column"),
		markdown: "",
		markdownSource: $("#markdown"),
		markdownHtml: document.getElementById("html"),
		markdownPreview: $("#preview"),
		markdownTargets: $("#html, #preview"),
		buttonsContainers: buttonsContainers,
		markdownTargetsTriggers: buttonsContainers.find(".switch"),
		topPanels: $("#top_panels_container .top_panel"),
		topPanelsTriggers: buttonsContainers.find(".toppanel"),
		quickReferencePreText: $("#quick-reference pre"),
		featuresTriggers: buttonsContainers.find(".feature"),
		wordCountContainers: $(".word-count"),
		isSyncScrollDisabled: true,
		isFullscreen: false,
		activePanel: null,
		themeSelector: document.getElementById("theme"),
		
		// Initiate editor
		init: function() {
			this.onloadEffect(0);
			this.initBindings();
			this.fitHeight();
			this.restoreState(function() {
				editor.onInput();
				editor.onloadEffect(1);
			});
			settings.initBindings();
		},

		// Handle events on several DOM elements
		initBindings: function() {
			$window.on("resize", function() {
				editor.fitHeight();
			});

			this.markdownSource.on("keydown", function(e) {
				if (!e.ctrlKey && e.keyCode == keyCode.TAB) editor.handleTabKeyPress(e);
			});

			if (doesSupportInputEvent) {
				this.markdownSource.on("input", function() {
					editor.onInput(true);
				});
			} else {
				var onInput = function() {
					editor.onInput(true);
				};

				this.markdownSource.on({
					"keyup change": onInput,

					"cut paste drop": function() {
						setTimeout(onInput, 0);
					}
				});
			}

			this.markdownTargetsTriggers.on("click", function(e) {
				e.preventDefault();
				editor.switchToPanel($(this).data("switchto"));
			});

			this.topPanelsTriggers.on("click", function(e) {
				e.preventDefault();
				editor.toggleTopPanel($("#"+ $(this).data("toppanel")));
			});

			this.topPanels.children(".close").on("click", function(e) {
				e.preventDefault();
				editor.closeTopPanels();
			});

			this.quickReferencePreText.on("click", function() {
				editor.addToMarkdownSource($(this).text());
			});

			this.featuresTriggers.on("click", function(e) {
				e.preventDefault();
				var t = $(this);
				editor.toggleFeature(t.data("feature"), t.data());
			});
		},

		onInput: function(isUserInput) {
			var updatedMarkdown = this.markdownSource.val();

			if (updatedMarkdown != this.markdown) {
				this.markdown = updatedMarkdown;
				this.onChange(isUserInput);
			}
		},

		onChange: function(isAfterUserInput) {
			this.save("markdown", this.markdown);
			this.convertMarkdown(isAfterUserInput);
		},

		// Resize some elements to make the editor fit inside the window
		fitHeight: function() {
			var newHeight = $window.height() - this.wrappersMargin;
			this.fitHeightElements.each(function() {
				var t = $(this);
				if (t.closest("#left-column").length) {
					var thisNewHeight = newHeight - $("#top_panels_container").outerHeight();
				} else {
					var thisNewHeight = newHeight;
				}
				t.css({ height: thisNewHeight +"px" });
			});
		},

		// Save a key/value pair in the app storage (either Markdown text or enabled features)
		save: function(key, value) {
			app.save(key, value);
		},

		// Restore the editor's state
		restoreState: function(c) {
			app.restoreState(function(restoredItems) {
				if (restoredItems.markdown) editor.markdownSource.val(restoredItems.markdown);
				if (restoredItems.isSyncScrollDisabled != "y") editor.toggleFeature("sync-scroll");
				if (restoredItems.isFullscreen == "y") editor.toggleFeature("fullscreen");
				editor.switchToPanel(restoredItems.activePanel || "preview");

				settings.restore({
					fontSizeFactor: restoredItems.fontSizeFactor,
					theme: restoredItems.theme
				});

				c();
			});
		},

		// Convert Markdown to HTML and update active panel
		convertMarkdown: function(isAfterUserInput) {
			var html;

			if (this.activePanel != "preview" && this.activePanel != "html") return;

			if (this.activePanel == "preview") {
				html = this.previewMarkdownConverter.render(this.markdown);
				app.updateMarkdownPreview(html, isAfterUserInput);

				this.triggerEditorUpdatedEvent(isAfterUserInput);
			} else if (this.activePanel == "html") {
				html = this.cleanHtmlMarkdownConverter.render(this.markdown);
				this.markdownHtml.value = html;
			}
		},

		triggerEditorUpdatedEvent: function(isAfterUserInput) {
			editor.markdownPreview.trigger("updated.editor", [{
				syncScrollReference: isAfterUserInput? editor.syncScroll.ref.CARET : editor.syncScroll.ref.SCROLLBAR
			}]);
		},

		// Programmatically add Markdown text to the textarea
		// pos = { start: Number, end: Number }
		addToMarkdownSource: function(markdown, pos, destPos) {
			var newMarkdownSourceVal, newMarkdownSourceLength,
				markdownSourceVal = this.markdown;

			// Add text at the end of the input
			if (typeof pos == "undefined") {
				if (markdownSourceVal.length) markdown = "\n\n"+ markdown;

				newMarkdownSourceVal = markdownSourceVal + markdown;
				newMarkdownSourceLength = newMarkdownSourceVal.length;

				this.updateMarkdownSource(newMarkdownSourceVal, { start: newMarkdownSourceLength, end: newMarkdownSourceLength });
			// Add text at a given position
			} else {
				newMarkdownSourceVal =
					markdownSourceVal.substring(0, pos.start) +
					markdown +
					markdownSourceVal.substring(pos.end);

				if (destPos) pos = destPos;
					else pos.start = pos.end = pos.start + markdown.length;

				this.updateMarkdownSource(newMarkdownSourceVal, pos);
			}
		},

		// Programmatically update the Markdown textarea with new Markdown text
		updateMarkdownSource: function(markdown, caretPos, isUserInput) {
			this.markdownSource.val(markdown);
			if (caretPos) this.setMarkdownSourceCaretPos(caretPos);

			this.onInput(isUserInput);
		},

		// Doesn't work in IE<9
		getMarkdownSourceCaretPos: function() {
			var markdownSourceEl = this.markdownSource[0];

			if (typeof markdownSourceEl.selectionStart != "number" || typeof markdownSourceEl.selectionEnd != "number") return;
			
			return {
				start: markdownSourceEl.selectionStart,
				end: markdownSourceEl.selectionEnd
			};
		},

		// Doesn't work in IE<9
		setMarkdownSourceCaretPos: function(pos) {
			var markdownSourceEl = this.markdownSource[0];

			if (!("setSelectionRange" in markdownSourceEl)) return;

			// Force auto-scroll to the caret's position by blurring then focusing the input (doesn't work in IE)
			// When calling setSelectionRange, Firefox will properly scroll to the range into view. Chrome doesn't,
			// but we can hack our way around by blurring and focusing the input to force auto-scroll to the caret's
			// position. Neither the proper behavior nor the hack work in IE. Not a big issue, and it'll be solved
			// when implementing "perfect" sync-scrolling.
			markdownSourceEl.blur();
			markdownSourceEl.setSelectionRange(pos.start, pos.end);
			markdownSourceEl.focus();
		},

		// Return the line where the character at position pos is situated in the source
		getMarkdownSourceLineFromPos: function(pos) {
			var sourceBeforePos = this.markdown.slice(0, pos.start);
			return sourceBeforePos.split("\n").length - 1;
		},

		getMarkdownSourceLineCount: function(pos) {
			return this.markdown.split("\n").length;
		},

		// Switch between editor panels
		switchToPanel: function(which) {
			var target = $("#"+ which),
				targetTrigger = this.markdownTargetsTriggers.filter("[data-switchto="+ which +"]");

			if (!this.isFullscreen || which != "markdown") this.markdownTargets.not(target).hide();
			target.show();

			this.markdownTargetsTriggers.not(targetTrigger).removeClass("active");
			targetTrigger.addClass("active");

			if (which != "markdown") this.featuresTriggers.filter("[data-feature=fullscreen][data-tofocus]").last().data("tofocus", which);

			if (this.isFullscreen) {
				var columnToShow = (which == "markdown")? this.markdownSource.closest(this.columns) : this.markdownPreview.closest(this.columns);

				columnToShow.show();
				this.columns.not(columnToShow).hide();
			}

			this.activePanel = which;
			this.save("activePanel", this.activePanel);

			// If one of the two panels displaying the Markdown output becomes visible, convert Markdown for that panel
			if (this.activePanel == "preview" || this.activePanel == "html") this.convertMarkdown();
		},

		// Toggle a top panel's visibility
		toggleTopPanel: function(panel) {
			if (panel.is(":visible")) this.closeTopPanels();
				else this.openTopPanel(panel);
		},

		// Open a top panel
		openTopPanel: function(panel) {
			var panelTrigger = this.topPanelsTriggers.filter("[data-toppanel="+ panel.attr("id") +"]");
			panel.show();
			panelTrigger.addClass("active");
			this.topPanels.not(panel).hide();
			this.topPanelsTriggers.not(panelTrigger).removeClass("active");
			this.fitHeight();
			$document.off("keydown.toppanel").on("keydown.toppanel", function(e) {
				if (e.keyCode == keyCode.ESCAPE) editor.closeTopPanels();
			});
		},

		// Close all top panels
		closeTopPanels: function() {
			this.topPanels.hide();
			this.topPanelsTriggers.removeClass("active");
			this.fitHeight();
			$document.off("keydown.toppanel");
		},

		// Toggle editor feature
		toggleFeature: function(which, featureData) {
			var featureTrigger = this.featuresTriggers.filter("[data-feature="+ which +"]");
			switch (which) {
				case "sync-scroll":
					this.toggleSyncScroll();
					break;
				case "fullscreen":
					this.toggleFullscreen(featureData);
					break;
			}
			featureTrigger.toggleClass("active");
		},

		toggleSyncScroll: (function() {
			var isMdSourceKeyPressed,

				refSyncScroll = function(e, arg) {
					var reference;

					if (e && e.type == "updated") reference = arg.syncScrollReference;
						else reference = isMdSourceKeyPressed? editor.syncScroll.ref.CARET : editor.syncScroll.ref.SCROLLBAR;

					editor.syncScroll(reference);
				};

			return function() {
				if (this.isSyncScrollDisabled) {
					this.markdownPreview.on("updated.editor", refSyncScroll);
					this.markdownSource.on({
						"scroll.syncScroll": refSyncScroll,
						"keydown.syncScroll": function(e) { isMdSourceKeyPressed = e.which < 91 || e.which > 93 }
					});
					$body.on("keyup.syncScroll", function() { isMdSourceKeyPressed = false });

					refSyncScroll();
					isMdSourceKeyPressed = false;
				} else {
					this.markdownPreview.off("updated.editor");
					this.markdownSource.off(".syncScroll");
					$body.off("keyup.syncScroll");
				}

				this.isSyncScrollDisabled = !this.isSyncScrollDisabled;
				this.save("isSyncScrollDisabled", this.isSyncScrollDisabled? "y" : "n");
			};
		})(),

		toggleFullscreen: function(featureData) {
			var toFocus = featureData && featureData.tofocus;
			this.isFullscreen = !this.isFullscreen;
			$body.toggleClass("fullscreen");
			if (toFocus) this.switchToPanel(toFocus);
			// Exit fullscreen
			if (!this.isFullscreen) {
				this.columns.show(); // Make sure all columns are visible when exiting fullscreen
				var activeMarkdownTargetsTriggersSwichtoValue = this.markdownTargetsTriggers.filter(".active").first().data("switchto");
				// Force one of the right panel's elements to be active if not already when exiting fullscreen
				if (activeMarkdownTargetsTriggersSwichtoValue == "markdown") {
					this.switchToPanel("preview");
				}
				// Emit update when exiting fullscreen and "preview" is already active since it changes width
				if (activeMarkdownTargetsTriggersSwichtoValue == "preview") {
					this.triggerEditorUpdatedEvent();
				}
				$document.off("keydown.fullscreen");
			// Enter fullscreen
			} else {
				this.closeTopPanels();
				$document.on("keydown.fullscreen", function(e) {
					if (e.keyCode == keyCode.ESCAPE) editor.featuresTriggers.filter("[data-feature=fullscreen]").last().trigger("click");
				});
			}
			this.save("isFullscreen", this.isFullscreen? "y" : "n");
			$body.trigger("fullscreen.editor", [this.isFullscreen]);
		},

		// Synchronize the scroll position of the preview panel with the source
		syncScroll: (function() {
			var syncScroll = function(reference) {
				var markdownPreview = this.markdownPreview[0],
					markdownSource = this.markdownSource[0];

				if (reference == editor.syncScroll.ref.SCROLLBAR) {
					markdownPreview.scrollTop = (markdownPreview.scrollHeight - markdownPreview.offsetHeight) * markdownSource.scrollTop / (markdownSource.scrollHeight  - markdownSource.offsetHeight);
				} else {
					app.scrollMarkdownPreviewCaretIntoView();
				}
			};

			syncScroll.ref = {
				CARET: 0,
				SCROLLBAR: 1
			};

			return syncScroll;
		})(),

		// Subtle fade-in effect
		onloadEffect: function(step) {
			switch (step) {
				case 0:
					$body.fadeTo(0, 0);
					break;
				case 1:
					$body.fadeTo(1000, 1);
					break;
			}
		},

		// Insert a tab character when the tab key is pressed (instead of focusing the next form element)
		// If multiple lines selected, indent them instead; or unindent on SHIFT + TAB
		handleTabKeyPress: function(e) {
			var selectedText, selectedLines, precText, precTextLastNLIndex, destSelPos,
				shouldIndentForward = !e.shiftKey,
				selPos = this.getMarkdownSourceCaretPos();

			if (!selPos) return;

			selectedText = this.markdown.slice(selPos.start, selPos.end);
			selectedLines = selectedText.split("\n");

			// Indent/unindent lines
			if (selectedLines.length > 1) {
				destSelPos = $.extend({}, selPos);

				// Extend selection to first new line char preceding the current selection
				// (in other words, include the whole first selected line into the selection)
				precText = this.markdown.slice(0, selPos.start);
				precTextLastNLIndex = precText.lastIndexOf("\n");
				selPos.start = precTextLastNLIndex + 1; // Index of char following \n if found, 0 otherwise
				selectedLines[0] = precText.slice(selPos.start) + selectedLines[0];

				// Insert/remove tabs at the beginning of all selected lines
				// Also adjust text selection indices to leave the right portion of text selected
				selectedLines = $.map(selectedLines, function(line, i) {
					if (shouldIndentForward) {
						if (i == 0) destSelPos.start++;
						destSelPos.end++;

						return "\t"+ line;
					} else {
						if (line.charAt(0) == "\t") {
							if (i == 0) destSelPos.start--;
							destSelPos.end--;

							return line.slice(1);
						} else {
							return line;
						}
					}
				});

				this.addToMarkdownSource(selectedLines.join("\n"), selPos, destSelPos);
			} else {
				// Unindent line if no text selection and previous character is a tab
				if (!shouldIndentForward && selPos.start == selPos.end && this.markdown.charAt(selPos.start - 1) == "\t") {
					selPos.start--;
					this.addToMarkdownSource("", selPos);
				// Replace selection with tab char
				} else {
					this.addToMarkdownSource("\t", selPos);
				}
			}

			e.preventDefault();
		},

		// Count the words in the Markdown output and update the word count in the corresponding
		// .word-count elements in the editor
		updateWordCount: function(text) {
			var wordCount = "";

			if (text.length) {
				wordCount = text.trim().replace(/\s+/gi, " ").split(" ").length;
				wordCount = wordCount.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") +" words"; // Format number (add commas and unit)
			}

			this.wordCountContainers.text(wordCount);
		}
		
	};

	var settings = (function() {
		var settingsPanel = $("#settings"),

			fontSize = {
				buttons: {
					inc: document.getElementById("increase-font-size"),
					dec: document.getElementById("decrease-font-size"),
					disabledClass: "is-disabled"
				},

				factor: 0,
				factorBounds: [-3, 12],
				cssStep: 1.2,

				update: function(factor) {
					var cssIncrement,
						prevFactor = this.factor;

					if (factor < this.factorBounds[0]) factor = this.factorBounds[0];
						else if (factor > this.factorBounds[1]) factor = this.factorBounds[1];

					if (factor == prevFactor) return;

					cssIncrement = (factor - prevFactor) * this.cssStep;
					this.factor = factor;
					editor.save("fontSizeFactor", factor);

					app.updateFontSize(cssIncrement);

					// Update buttons' visual state
					$(this.buttons.dec).toggleClass(this.buttons.disabledClass, factor == this.factorBounds[0]);
					$(this.buttons.inc).toggleClass(this.buttons.disabledClass, factor == this.factorBounds[1]);
				},

				increase: () => { fontSize.update(fontSize.factor + 1) },
				decrease: () => { fontSize.update(fontSize.factor - 1) }
			},

			theme = {
				buttons: {
					light: document.getElementById("use-light-theme"),
					dark: document.getElementById("use-dark-theme")
				},

				stylesheets: {
					lightThemeRef: document.getElementById("theme-light-ref"),
					darkThemeRef: document.getElementById("theme-dark-ref")
				},

				use: function(theme) {
					editor.save("theme", theme);
					app.useTheme(this.stylesheets[theme + "ThemeRef"].getAttribute("data-href"));
				}
			};

		return {
			restore: function(restoredSettings) {
				// restoredSettings.fontSizeFactor can be null or undefined depending on the storage used; fortunately undefined == null
				if (restoredSettings.fontSizeFactor != null) fontSize.update(+restoredSettings.fontSizeFactor);

				// Restore theme if saved, otherwise default to light theme
				theme.use(restoredSettings.theme || "light");
			},

			initBindings: function() {
				settingsPanel.on("click", function(e) {
					e.preventDefault();

					if (e.target == fontSize.buttons.inc || e.target == fontSize.buttons.dec) {
						var factor = fontSize.factor + (e.target == fontSize.buttons.inc? 1 : -1);
						fontSize.update(factor);
					}

					if (e.target == theme.buttons.light) {
						theme.use("light");
					}

					if (e.target == theme.buttons.dark) {
						theme.use("dark");
					}
				});

				shortcutManager.register([
					"CTRL + PLUS",
					"CTRL + PLUS_FF",
					"CTRL + SHIFT + PLUS",
					"CTRL + SHIFT + PLUS_FF",
					"CTRL + NUMPADPLUS"
				], function(e) {
					e.preventDefault();
					fontSize.increase();
				});

				shortcutManager.register([
					"CTRL + MINUS",
					"CTRL + MINUS_FF",
					"CTRL + SHIFT + MINUS",
					"CTRL + SHIFT + MINUS_FF",
					"CTRL + NUMPADMINUS"
				], function(e) {
					e.preventDefault();
					fontSize.decrease();
				});

				$document.on("wheel", function(e) {
					var isScrollingUp;

					// Clone deltaY onto the jQuery event object ourselves
					if (!e.hasOwnProperty("deltaY")) e.deltaY = e.originalEvent.deltaY;

					if ((!e.ctrlKey && !e.metaKey) || !e.deltaY) return;

					e.preventDefault();

					if (Modal.isModalOpen()) return;

					isScrollingUp = e.deltaY < 0;
					if (isScrollingUp) fontSize.increase();
						else fontSize.decrease();
				});
			}
		};
	})();
	
});
