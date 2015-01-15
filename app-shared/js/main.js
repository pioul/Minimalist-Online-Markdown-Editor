var editor,
	$window = $(window),
	$document = $(document);

$document.ready(function() {
	"use strict";

	var buttonsContainers = $(".buttons-container");
	
	editor = {
		
		// Editor variables
		body: $(document.body),
		fitHeightElements: $(".full-height"),
		wrappersMargin: $("#left-column > .wrapper:first").outerHeight(true) - $("#left-column > .wrapper:first").height(),
		markdownConverter: new Showdown.converter(),
		columns: $("#left-column, #right-column"),
		markdown: "",
		markdownSource: $("#markdown"),
		markdownPreview: $("#preview"),
		markdownTargets: $("#html, #preview"),
		buttonsContainers: buttonsContainers,
		markdownTargetsTriggers: buttonsContainers.find(".switch"),
		topPanels: $("#top_panels_container .top_panel"),
		topPanelsTriggers: buttonsContainers.find(".toppanel"),
		quickReferencePreText: $("#quick-reference pre"),
		featuresTriggers: buttonsContainers.find(".feature"),
		wordCountContainers: $(".word-count"),
		isAutoScrolling: false,
		isFullscreen: false,
		
		// Initiate editor
		init: function() {
			this.onloadEffect(0);
			this.initBindings();
			this.fitHeight();
			this.restoreState(function() {
				editor.onInput();
				editor.onloadEffect(1);
			});
		},

		// Handle events on several DOM elements
		initBindings: function() {
			$window.on("resize", function() {
				editor.fitHeight();
			});

			$("#markdown").on("scroll", function(e) {
			    if (editor.isAutoScrolling) editor.syncScroll();
			});

			this.markdownSource.on("keydown", function(e) {
				if (!e.ctrlKey && e.keyCode == keyCode.TAB) editor.handleTabKeyPress(e);
			});

			if (doesSupportInputEvent) {
				this.markdownSource.on("input", function() {
					editor.onInput();
				});
			} else {
				var onInput = function() {
					editor.onInput();
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

		onInput: function() {
			var updatedMarkdown = this.markdownSource.val();

			if (updatedMarkdown != this.markdown) {
				this.markdown = updatedMarkdown;
				this.onChange();
			}
		},

		onChange: function() {
			this.save("markdown", this.markdown);
			this.convertMarkdown();
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
				if (restoredItems.isAutoScrolling == "y") editor.toggleFeature("auto-scroll");
				if (restoredItems.isFullscreen == "y") editor.toggleFeature("fullscreen");
				editor.switchToPanel(restoredItems.activePanel || "preview");

				c();
			});
		},

		// Convert Markdown to HTML using showdown.js
		convertMarkdown: function() {
			var html = this.markdownConverter.makeHtml(this.markdown);
			document.getElementById("html").value = html;
			app.updateMarkdownPreview(html);
			this.markdownPreview.trigger("updated.editor");
		},

		// Programmatically add Markdown text to the textarea
		// pos = { start: Number, end: Number }
		addToMarkdownSource: function(markdown, pos) {
			var markdownSourceVal = this.markdown;

			// Add text at the end of the input
			if (typeof pos == "undefined") {
				if (markdownSourceVal.length) markdown = "\n\n"+ markdown;
				this.updateMarkdownSource(markdownSourceVal + markdown);
			// Add text at a given position
			} else {
				var newMarkdownSourceVal =
					markdownSourceVal.substring(0, pos.start) +
					markdown +
					markdownSourceVal.substring(pos.end);

				pos.start = pos.end = pos.start + markdown.length;

				this.updateMarkdownSource(newMarkdownSourceVal, pos);
			}
		},

		// Programmatically update the Markdown textarea with new Markdown text
		updateMarkdownSource: function(markdown, caretPos) {
			this.markdownSource.val(markdown);
			if (caretPos) this.setMarkdownSourceCaretPos(caretPos);

			this.onInput();
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

			markdownSourceEl.blur(); // Force auto-scroll to the caret's position by blurring then focusing the input
			markdownSourceEl.setSelectionRange(pos.start, pos.end);
			markdownSourceEl.focus();
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
			if (this.isAutoScrolling && which == "preview") {
				this.markdownPreview.trigger("updated.editor"); // Auto-scroll on switch since it wasn't possible earlier due to the preview being hidden
			}
			this.save("activePanel", which);
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
				case "auto-scroll":
					this.toggleAutoScroll();
					break;
				case "fullscreen":
					this.toggleFullscreen(featureData);
					break;
			}
			featureTrigger.toggleClass("active");
		},

		toggleAutoScroll: function() {
			if (!this.isAutoScrolling) {
				this.markdownPreview
					.on("updated.editor", function() {
						editor.syncScroll();
					})
					.trigger("updated.editor");
			} else {
				this.markdownPreview.off("updated.editor");
			}
			this.isAutoScrolling = !this.isAutoScrolling;
			this.save("isAutoScrolling", this.isAutoScrolling? "y" : "n");
		},

		toggleFullscreen: function(featureData) {
			var toFocus = featureData && featureData.tofocus;
			this.isFullscreen = !this.isFullscreen;
			this.body.toggleClass("fullscreen");
			if (toFocus) this.switchToPanel(toFocus);
			// Exit fullscreen
			if (!this.isFullscreen) {
				this.columns.show(); // Make sure all columns are visible when exiting fullscreen
				var activeMarkdownTargetsTriggersSwichtoValue = this.markdownTargetsTriggers.filter(".active").first().data("switchto");
				// Force one of the right panel's elements to be active if not already when exiting fullscreen
				if (activeMarkdownTargetsTriggersSwichtoValue == "markdown") {
					this.switchToPanel("preview");
				}
				// Auto-scroll when exiting fullscreen and "preview" is already active since it changes width
				if (this.isAutoScrolling && activeMarkdownTargetsTriggersSwichtoValue == "preview") {
					this.markdownPreview.trigger("updated.editor");
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
			this.body.trigger("fullscreen.editor", [this.isFullscreen]);
		},

		// Synchronize the scroll position of the preview panel with the source editor
		syncScroll: function() {
			editor.markdownPreview.scrollTop(
				( document.getElementById("preview").scrollHeight - editor.markdownPreview.height() )
				* editor.markdownSource.scrollTop() / 
				( document.getElementById("markdown").scrollHeight - $("#markdown").height())
			);
		},

		// Subtle fade-in effect
		onloadEffect: function(step) {
			switch (step) {
				case 0:
					this.body.fadeTo(0, 0);
					break;
				case 1:
					this.body.fadeTo(1000, 1);
					break;
			}
		},

		// Insert a tab character when the tab key is pressed (instead of focusing the next form element)
		handleTabKeyPress: function(e) {
			var caretPos = this.getMarkdownSourceCaretPos();
			if (!caretPos) return;

			e.preventDefault();

			this.addToMarkdownSource("\t", caretPos);
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
	
});
