$(document).on("ready", function(){
	
	editor = {
		
		// variables
		fitHeightElements: $(".full-height"),
		wrappersMargin: $("#left-column > .wrapper:first").outerHeight(true) - $("#left-column > .wrapper:first").height(),
		markdownConverter: new Showdown.converter(),
		columns: $("#left-column, #right-column"),
		markdownSource: $("#markdown"),
		markdownPreview: $("#preview"),
		markdownTargets: $("#html, #preview"),
		markdownTargetsTriggers: $(".overlay .switch"),
		topPanels: $("#top_panels_container .top_panel"),
		topPanelsTriggers: $("#left-column .overlay .toppanel"),
		quickReferencePreText: $("#quick-reference pre"),
		featuresTriggers: $(".overlay .feature"),
		isAutoScrolling: false,
		isFullscreen: false,
		
		// functions
		init: function(){
			this.onloadEffect(0);
			this.bind();
			this.switchToTarget('preview');
			this.fitHeight();
			this.convert();
			this.onloadEffect(1);
		},
		bind: function(){
			$(window).on("resize", function(){
				editor.fitHeight();
			});
			this.markdownSource.on("keyup change", function(){
				editor.convert();
			});
			this.markdownSource.on("cut paste drop", function(){
				setTimeout(function(){
					editor.convert();
				}, 1);
			});
			this.markdownTargetsTriggers.on("click", function(e){
				e.preventDefault();
				editor.switchToTarget($(this).data("switchto"));
			});
			this.topPanelsTriggers.on("click", function(e){
				e.preventDefault();
				editor.toggleTopPanel($(this).data("toppanel"));
			});
			this.topPanels.children(".close").on("click", function(e){
				e.preventDefault();
				editor.closeTopPanel();
			});
			this.quickReferencePreText.on("click", function(){
				editor.addToMarkdownSource($(this).text());
			});
			this.featuresTriggers.on("click", function(e){
				e.preventDefault();
				var t = $(this);
				editor.toggleFeature(t.data("feature"), t.data());
			});
		},
		fitHeight: function(){
			var newHeight = $(window).height() - this.wrappersMargin;
			this.fitHeightElements.each(function(){
				if($(this).closest("#left-column").length){
					var thisNewHeight = newHeight - $("#top_panels_container").outerHeight();
				} else {
					var thisNewHeight = newHeight;
				}
				$(this).css({ height: thisNewHeight +'px' });
			});
		},
		convert: function(){
			var markdown = this.markdownSource.val(),
				html = this.markdownConverter.makeHtml(markdown);
			$("#html").val(html);
			this.markdownPreview
				.html(html)
				.trigger("updated");
		},
		addToMarkdownSource: function(markdown){
			var markdownSourceValue = this.markdownSource.val();
			if(markdownSourceValue != '') markdownSourceValue += '\n\n';
			this.markdownSource.val(markdownSourceValue + markdown);
			this.convert();
		},
		switchToTarget: function(which){
			var target = $("#"+ which),
				targetTrigger = this.markdownTargetsTriggers.filter("[data-switchto="+ which +"]");
			if(!this.isFullscreen || which != "markdown") this.markdownTargets.not(target).hide();
			target.show();
			this.markdownTargetsTriggers.not(targetTrigger).removeClass("active");
			targetTrigger.addClass("active");
			if(which != "markdown") this.featuresTriggers.filter("[data-feature=fullscreen][data-tofocus]").last().data("tofocus", which);
			if(this.isFullscreen){
				var columnToShow = (which == "markdown")? this.markdownSource.closest(this.columns) : this.markdownPreview.closest(this.columns);
				columnToShow.show();
				this.columns.not(columnToShow).hide();
			}
			if(this.isAutoScrolling && which == "preview"){
				this.markdownPreview.trigger("updated"); // auto-scroll on switch since it wasn't earlier due to the preview being hidden
			}
		},
		toggleTopPanel: function(which){
			var panel = $("#"+ which),
				panelTrigger = this.topPanelsTriggers.filter("[data-toppanel="+ which +"]");
			this.topPanels.not(panel).hide();
			panel.toggle();
			this.topPanelsTriggers.not(panelTrigger).removeClass("active");
			panelTrigger.toggleClass("active");
			this.fitHeight();
		},
		closeTopPanel: function(){
			this.topPanels.hide();
			this.topPanelsTriggers.removeClass("active");
			this.fitHeight();
		},
		toggleFeature: function(which, featureData){
			var featureTrigger = this.featuresTriggers.filter("[data-feature="+ which +"]");
			switch(which){
				case "auto-scroll":
					this.toggleAutoScroll();
					break;
				case "fullscreen":
					this.toggleFullscreen(featureData);
					break;
			}
			featureTrigger.toggleClass("active");
		},
		toggleAutoScroll: function(){
			if(!this.isAutoScrolling){
				this.markdownPreview
					.on("updated", function(){
						this.scrollTop = this.scrollHeight;
					})
					.trigger("updated");
			} else {
				this.markdownPreview.off("updated");
			}
			this.isAutoScrolling = !this.isAutoScrolling;
		},
		toggleFullscreen: function(featureData){
			var toFocus = featureData.tofocus;
			this.isFullscreen = !this.isFullscreen;
			$(document.body).toggleClass("fullscreen");
			if(toFocus) this.switchToTarget(toFocus);
			if(!this.isFullscreen){
				this.columns.show(); // make sure all columns are visible when exiting fullscreen
				var activeMarkdownTargetsTriggersSwichtoValue = this.markdownTargetsTriggers.filter(".active").first().data("switchto");
				// force one of the right panel's elements to be active if not already when exiting fullscreen
				if(activeMarkdownTargetsTriggersSwichtoValue == "markdown"){
					this.switchToTarget("preview");
				}
				// auto-scroll when exiting fullscreen and "preview" is already active since it changes width
				if(this.isAutoScrolling && activeMarkdownTargetsTriggersSwichtoValue == "preview"){
					this.markdownPreview.trigger("updated");
				}
				$(document).off(".fullscreen");
			} else {
				this.closeTopPanel();
				// exit fullscreen when the escape key is pressed
				$(document).on("keyup.fullscreen", function(e){
					if(e.keyCode == 27) editor.featuresTriggers.filter("[data-feature=fullscreen]").last().trigger("click");
				});
			}
		},
		onloadEffect: function(step){
			var theBody = $(document.body);
			switch(step){
				case 0:
					theBody.fadeTo(0, 0);
					break;
				case 1:
					theBody.fadeTo(1000, 1);
					break;
			}
		}
		
	};
	
	editor.init();
	
});