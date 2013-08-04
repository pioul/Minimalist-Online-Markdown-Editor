$(document).on("ready", function(){
	
	editor = {
		
		// variables
		fitHeightElements: $(".full-height"),
		wrappersMargin: $("#left-column > .wrapper:first").outerHeight(true) - $("#left-column > .wrapper:first").height(),
		markdownConverter: new Showdown.converter(),
		markdownSource: $("#markdown"),
		markdownPreview: $("#preview"),
		markdownTargets: $("#html, #preview"),
		markdownTargetsTriggers: $("#right-column .overlay .switch"),
		topPanels: $("#top_panels_container .top_panel"),
		topPanelsTriggers: $("#left-column .overlay .toppanel"),
		quickReferencePreText: $("#quick-reference pre"),
		activatedFeatures: [],
		featuresTriggers: $("#right-column .overlay .feature"),
		
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
			this.featuresTriggers.on("click", function(){
				editor.toggleFeature($(this).data("feature"));
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
			this.markdownTargets.not(target).hide();
			target.show();
			this.markdownTargetsTriggers.not(targetTrigger).removeClass("active");
			targetTrigger.addClass("active");
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
		toggleFeature: function(which){
			var featureTrigger = this.featuresTriggers.filter("[data-feature="+ which +"]");
			switch(which){
				case "auto-scroll":
					this.toggleAutoScroll();
					break;
			}
			featureTrigger.toggleClass("active");
		},
		toggleAutoScroll: function(){
			var activatedFeaturesFeatureIndex = $.inArray("auto-scroll", this.activatedFeatures);
			if(activatedFeaturesFeatureIndex == -1){
				this.markdownPreview.on("updated", function(){
					this.scrollTop = this.scrollHeight;
				});
				this.markdownPreview.trigger("updated");
				this.activatedFeatures.push("auto-scroll");
			} else {
				this.markdownPreview.off("updated");
				this.activatedFeatures.splice(activatedFeaturesFeatureIndex, 1);
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