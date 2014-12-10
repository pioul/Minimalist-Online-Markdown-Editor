var app;

$document.ready(function() {
	"use strict";

	app = {

		// Chrome app variables
		markdownPreviewIframe: $("#preview-iframe"),
		isMarkdownPreviewIframeLoaded: false,
		markdownPreviewIframeLoadEventCallbacks: $.Callbacks(),

		init: function() {
			editor.init();
			this.initBindings();
			this.initFSBindings();
			fileMenu.init();
		},

		initBindings: function() {
			$window.on({
				message: app.receiveMessage.bind(app),
				focus: app.checkActiveFileForChanges.bind(app)
			});

			// In the Chrome app, the preview panel requires to be in a sandboxed iframe, hence isn't loaded immediately with the rest of the document
			this.markdownPreviewIframe.on("load", function() {
				app.isMarkdownPreviewIframeLoaded = true;
				app.markdownPreviewIframeLoadEventCallbacks.fire();
			});
		},

		// Listen for drag and drop and key combinations to open/save files from/to the file system
		initFSBindings: function() {
			editor.body.on({
				// Indicate the body is a valid drop target
				"dragenter dragover": function(e) {
					if (e.originalEvent.dataTransfer.types.indexOf("Files") != -1) {
						e.preventDefault();
					}
				},

				drop: function(e) {
					var dt = e.originalEvent.dataTransfer;

					if (dt.types.indexOf("Files") != -1) {
						e.preventDefault();
					}

					if (dt.files.length) {
						Array.prototype.forEach.call(dt.files, function(file) {
							// Only accept files that are some type of text (most commonly "text/plain") or of unknown type (such as .md as of today)
							if (!file.type || file.type.indexOf("text/") == 0) {
								var reader = new FileReader();
								reader.onload = function() {
									console.log(reader.result);
									// PUT THE FILE CONTENTS IN THE MD PANEL HERE
									// Find a way to do this in a DRY way: replace md contents, trigger change event?, save in localstorage?, convert md
								};
								reader.onerror = function() {
									console.log("failed reading file");
								};
								reader.readAsText(file);
							}
						});
					}

					// console.log(e);
					var a = JSON.stringify(e.originalEvent.dataTransfer);
					console.log(a);
				}
			});

			shortcutManager.register(["CTRL + N", "CTRL + T"], function(e) {
				e.preventDefault();
				fileSystem.chooseNewTempFile();
			});

			shortcutManager.register("CTRL + O", function(e) {
				e.preventDefault();
				fileSystem.chooseEntries();
			});

			shortcutManager.register("CTRL + S", function(e) {
				e.preventDefault();
				
				var file = fileSystem.getFile(fileMenu.activeItemId);
				file.save()
					.then(function() { console.log("SAVE SUCCESSFUL", fileSystem.getFile(fileMenu.activeItemId), arguments)})
					.catch(function(reason) {
						console.log("SAVE UNSUCCESSFUL", fileSystem.getFile(fileMenu.activeItemId), arguments);
						if ([fileSystem.File.SAVE_REJECTION_MSG, fileSystem.USER_CLOSED_DIALOG_REJECTION_MSG].indexOf(reason) == -1) throw reason;
					})
					.done();
			});

			shortcutManager.register("CTRL + SHIFT + S", function(e) {
				e.preventDefault();

				var file = fileSystem.getFile(fileMenu.activeItemId);
				file.saveAs()
					.then(function() { console.log("SAVEAS SUCCESSFUL", fileSystem.getFile(fileMenu.activeItemId), arguments)})
					.catch(function(reason) {
						console.log("SAVEAS UNSUCCESSFUL", fileSystem.getFile(fileMenu.activeItemId), arguments);
						if (reason != fileSystem.USER_CLOSED_DIALOG_REJECTION_MSG) throw reason;
					})
					.done();
			});

			shortcutManager.register("CTRL + W", function(e) {
				e.preventDefault();
				fileSystem.getFile(fileMenu.activeItemId).close();
			});
		},

		// Post messages to the iframe
		// Currently only used to transfer HTML from this window to the iframe for display
		postMessage: function(data) {
			this.markdownPreviewIframe[0].contentWindow.postMessage(data, "*");
		},

		// Receive messages sent to this window (from the iframe)
		receiveMessage: function(e) {
			var e = e.originalEvent;
			
			if (e.data.hasOwnProperty("height")) this.updateMarkdownPreviewIframeHeight(e.data.height);
			if (e.data.hasOwnProperty("text")) editor.updateWordCount(e.data.text);
		},

		// Save a key/value pair in chrome.storage (either Markdown text or enabled features)
		// This method can be called from editor.save() to save things from /editor, or directly for key/value storage
		// It must thus allow for two types of usage: replication of usage from editor.save, and app-specific storage
		// And, the Chrome app allowing multiple files and tabs to be open at once (while the basic editor doesn't), 
		// the key/value pair has to be transformed to a more complex format when key == "markdown"
		save: function(key, value) {
			// Hijack saving to convert the key/value pair to a more complex format
			if (key == "markdown") {
				let file = fileSystem.getFile(fileMenu.activeItemId);

				file.setCachedProp("tempContents", value);

				return;
			}

			var items = {};
			items[key] = value;

			chrome.storage.local.set(items);
		},

		// Restore the editor's state from chrome.storage (saved Markdown and enabled features)
		restoreState: function(c) {
			// restoreState needs the preview panel to be loaded: if it isn't loaded when restoreState is called, call restoreState again as soon as it is
			if (!this.isMarkdownPreviewIframeLoaded) {
				this.markdownPreviewIframeLoadEventCallbacks.add(function() {
					app.restoreState(c);
				});

				return;
			}

			// Retrieve locally stored data to be sent to editor
			// In the same way the "markdown" key is hijacked when saving the editor's contents, it's not included here so that the app can handle the restoration of the editor's contents itself
			chrome.storage.local.get(["isAutoScrolling", "isFullscreen", "activePanel"], c);

			// Retrieve locally stored data to be handled by the app
			// Restore openFilesIds, files and activeFileMenuItemId, in that order and while making sure the previous item has been restored before restoring the next
			chrome.storage.local.get(["openFilesIds", "filesCache", "activeFileMenuItemId"], function(restoredItems) { console.log("restoredItems", restoredItems);
				if (restoredItems.openFilesIds) fileSystem.restoreFiles(restoredItems.openFilesIds);
				if (restoredItems.filesCache) fileSystem.restoreFilesCachedProps(restoredItems.filesCache);
				fileMenu.switchToItem(restoredItems.activeFileMenuItemId);
			});
		},

		// Update the preview panel with new HTML
		updateMarkdownPreview: function(html) {
			this.postMessage(html);
		},

		updateMarkdownPreviewIframeHeight: function(height) {
			this.markdownPreviewIframe.css("height", height);
			editor.markdownPreview.trigger("updated.editor");
		},

		// Automatically check whether the active file has changed when the app window regains focus
		checkActiveFileForChanges: function() {
			var activeFile = fileSystem.getFile(fileMenu.activeItemId);
			if (!activeFile.isTempFile()) activeFile.checkDiskContents();
		}

	};

	// MME's file system
	// Handles I/O with the real FS, but also takes care of much more files-related stuff
	var fileSystem = (function() {

		var files = new Map(),

			// fileSystem.cache takes care of saving things to persist them between sessions even if the user didn't explicitly ask to
			// -> Everything that goes into fileSystem goes into fileSystem.cache, but the reverse isn't true (in other words, fileSystem.cache saves only a subset of the files' properties, that is the props that are cached)
			// fileSystem saves to chrome.fileSystem, fileSystem.cache saves to chrome.storage.local
			cache = (function() {
				var openFilesIds = [], // Stores files' ids, and their sorting order
					filesCache = {}; // Stores additional properties for files, mapped to the files' ids

				return {
					addFile: function(id) {
						openFilesIds.push(id);

						filesCache[id] = {
							entryId: null,
							origContents: "",
							tempContents: ""
						};

						this.save();

						return filesCache[id];
					},

					// Shouldn't be called directly: abstracted as File.prototype.setCachedProp(propKey, propVal)
					updateFileCachedProp: function(id, propKey, propVal) {
						filesCache[id][propKey] = propVal;
						this.save(this.saveThe.filesCache);
					},

					restoreFilesCachedProps: function(filesCachedProps) {
						var fileCachedProps;

						for (let id in filesCachedProps) {
							if (filesCachedProps.hasOwnProperty(id) && filesCache.hasOwnProperty(id)) {
								let file = fileSystem.getFile(id);
								fileCachedProps = filesCachedProps[id];

								for (let propKey in fileCachedProps) {
									if (fileCachedProps.hasOwnProperty(propKey)) {
										let propVal = fileCachedProps[propKey];

										// If that file has an entryId, hijack the normal flow to make the file permanent
										if (propKey == "entryId" && propVal != null) {
											chrome.fileSystem.restoreEntry(propVal, function(entry) {
												if (typeof entry != "undefined") {
													file.makePermanent(entry);
													fileMenu.updateItemName(file);
												}
											});

											continue;
										}

										file.setCachedProp(propKey, propVal);
									}
								}
							}
						}
					},

					removeFile: function(id) {
						var openFilesIdsIndex = openFilesIds.indexOf(id);

						if (openFilesIdsIndex != -1) openFilesIds.splice(openFilesIdsIndex, 1);
						delete filesCache[id];

						this.save();
					},

					// Enum containing options to combine and pass to the save method
					saveThe: {
						filesCache: 1,
						openFilesIds: 2
					},

					// The bit flags above can be either combined (as usual) or omitted (same result as combining them all)
					save: function(toSave) {
						if (!toSave || toSave & this.saveThe.filesCache) app.save("filesCache", filesCache);
						if (!toSave || toSave & this.saveThe.openFilesIds) app.save("openFilesIds", openFilesIds);
					},

					// Shouldn't be called directly: abstracted as fileSystem.getOpenFileIdAtIndex()
					getOpenFileIdAtIndex: function(index) {
						return openFilesIds[index];
					},

					// Shouldn't be called directly: abstracted as fileSystem.getLastOpenFileId()
					getLastOpenFileId: function() {
						return openFilesIds[openFilesIds.length - 1];
					},

					// Shouldn't be called directly: abstracted as fileSystem.getClosestOpenFileId()
					// Returns the id of the closest open file, ideally the next one, or the prev one if none to the right, or null
					getClosestOpenFileId: function(id) {
						var openFileIdIndex = openFilesIds.indexOf(id);
						if (openFileIdIndex == -1 || openFilesIds.length <= 1) return null; // No open file other than this one

						if (openFileIdIndex >= openFilesIds.length - 1) return openFilesIds[--openFileIdIndex]; // No open file next, return previous file id instead

						return openFilesIds[++openFileIdIndex]; // There's an open file next, return its id
					},

					// Shouldn't be called directly: abstracted as fileSystem.getNextOpenFileId()
					// Returns the id of the next open file, looping over to the first when necessary, or null
					getNextOpenFileId: function(id) {
						var openFileIdIndex = openFilesIds.indexOf(id);
						if (openFileIdIndex == -1 || openFilesIds.length <= 1) return null; // No open file other than this one

						openFileIdIndex++;
						if (openFileIdIndex > openFilesIds.length - 1) openFileIdIndex = 0;

						return openFilesIds[openFileIdIndex];
					},

					// Shouldn't be called directly: abstracted as fileSystem.getPrevOpenFileId()
					// Returns the id of the next open file, looping over to the last when necessary, or null
					getPrevOpenFileId: function(id) {
						var openFileIdIndex = openFilesIds.indexOf(id);
						if (openFileIdIndex == -1 || openFilesIds.length <= 1) return null; // No open file other than this one

						openFileIdIndex--;
						if (openFileIdIndex < 0) openFileIdIndex = openFilesIds.length - 1;

						return openFilesIds[openFileIdIndex];
					}
				};
			})(),

			fsMethods = {
				chooseEntries: function() {
					chrome.fileSystem.chooseEntry(
						{
							type: "openWritableFile",
							accepts: [{
								extensions: ["md", "txt"]
							}],
							acceptsMultiple: true
						},
						function(entries) {
							if (typeof entries == "undefined") return; // undefined when user closes dialog

							var promise,
								promisedPermFilesBeingCreated = [];

							for (var i = 0, ln = entries.length; i < ln; i++) {
								promise = fileSystem.createPermFile(entries[i]);
								promisedPermFilesBeingCreated.push(promise);
							}

							Promise.all(promisedPermFilesBeingCreated).then(function() {
								fileMenu.switchToItem();
							}).done();
						}
					);
				},

				writeToEntry: function(entry, text) {
					return new Promise(function(resolvePromise, rejectPromise) {
						chrome.fileSystem.getWritableEntry(entry, function(writableEntry) {
							writableEntry.createWriter(function(writer) {
								writer.onerror = function() {
									rejectPromise(fileSystem.WRITETOENTRY_REJECTION_MSG);
								};

								writer.onwriteend = function() {
									writer.onwriteend = resolvePromise;
									entry.file(function() {
										var blob = new Blob([text]);
										writer.write(blob, {type: "text/plain"});
									});
								};

								writer.truncate(0);
							});
						});
					});
				},

				writeToNewEntry: function(text) {
					return new Promise(function(resolvePromise, rejectPromise) {
						chrome.fileSystem.chooseEntry(
							{
								type: "saveFile",
								accepts: [{
									extensions: ["md", "txt"]
								}]
							},
							function(writableEntry) {
								if (typeof writableEntry == "undefined") { rejectPromise(fileSystem.USER_CLOSED_DIALOG_REJECTION_MSG); return; }

								writableEntry.createWriter(function(writer) {
									writer.onerror = function() {
										rejectPromise(fileSystem.WRITETOENTRY_REJECTION_MSG);
									};

									writer.onwriteend = resolvePromise.bind(null, writableEntry);

									writer.write(new Blob([text]), {type: "text/plain"});
								});
							}
						);
					});
				},

				chooseNewTempFile: function() {
					fileSystem.createTempFile(generateUniqueFileId());
					fileMenu.switchToItem();
				},

				// Restore cached files from their ids, saved in chrome.storage
				restoreFiles: function(ids) {
					for (let id of ids) fileSystem.createTempFile(id);
				},

				restoreFilesCachedProps: cache.restoreFilesCachedProps.bind(cache),

				createTempFile: function(id) {
					var file = new fileSystem.File(id);
					fileMenu.addItem(file);

					return file;
				},

				createPermFile: function(entry) {
					var file, promise;

					file = new fileSystem.File(generateUniqueFileId());
					file.makePermanent(entry);
					fileMenu.addItem(file);
					promise = file.read().then(function(fileContents) {
						file.setCachedProp("tempContents", fileContents);
					});

					return promise;
				},

				getOpenFileIdAtIndex: cache.getOpenFileIdAtIndex.bind(cache),
				getLastOpenFileId: cache.getLastOpenFileId.bind(cache),
				getClosestOpenFileId: cache.getClosestOpenFileId.bind(cache),
				getNextOpenFileId: cache.getNextOpenFileId.bind(cache),
				getPrevOpenFileId: cache.getPrevOpenFileId.bind(cache),

				setFile: files.set.bind(files),
				getFile: files.get.bind(files),
				hasFile: files.has.bind(files),
				deleteFile: function(id) {
					var r = files.delete(id);
					if (this.isEmpty()) this.chooseNewTempFile();

					return r;
				},
				isEmpty: function(id) { return !files.size }
			},

			fsConstants = {
				WRITETOENTRY_REJECTION_MSG: "Failed writing to FS entry.",
				USER_CLOSED_DIALOG_REJECTION_MSG: "User closed dialog."
			},

			// A temporary file (one that's only stored in the cache, w/o being linked to the file system) is identified by this.isTempFile() == true
			// A permanent file has this.cache.entryId set to the fs entry id, this.entry to the entry itself, and this.isTempFile() == false
			File = function(id) {
				this.id = id;
				this.name = "untitled";
				console.log("File constructor:", this, id);
				this.cache = cache.addFile(this.id);
				fileSystem.setFile(this.id, this);
			};

		File.prototype.makePermanent = function(entry) {
			this.setCachedProp("entryId", chrome.fileSystem.retainEntry(entry));
			this.entry = entry;
			this.name = entry.name;
		};

		File.prototype.isTempFile = function() { return !this.cache.entryId };

		File.prototype.read = function() {
			var file = this;

			return new Promise(function(resolvePromise, rejectPromise) {
				var text,
					reader = new FileReader();
				reader.onload = function() {
					text = normalizeNewlines(reader.result);

					file.setCachedProp("origContents", text);
					resolvePromise(text);
				};

				reader.onerror = function() {
					console.log("failed reading file");
					rejectPromise();
				};

				file.entry.file(function(file) {
					reader.readAsText(file);
				});
			});
		};

		// Load the file's cached contents into the editor
		// Also read from the file to see if the cached contents are different from the file's
		File.prototype.loadInEditor = function() { console.log("loadInEditor file:", this);
			editor.updateMarkdownSource(this.cache.tempContents, true);
			if (!this.isTempFile()) this.checkDiskContents();
		};

		// Read the file's contents from the disk, update the cache, and update the editor's contents
		// (If the user has changed that file's contents in the editor in the meantime, ask him if he'd like to reload it from the fs)
		File.prototype.checkDiskContents = function() {
			var file = this,
				pastOrigContents = file.cache.origContents,
				fileHasTempChanges = file.hasTempChanges();

			file.read().then(function(fileContents) {
				if (fileContents != pastOrigContents) {
					let updateEditorContents = function() {
						editor.updateMarkdownSource(fileContents);
					};

					if (fileHasTempChanges) {
						confirm("The file has changed on disk. Reload it?")
							.then(updateEditorContents)
							.catch(function(reason) {
								if (reason != confirm.REJECTION_MSG) throw reason;
							})
							.done();
					} else {
						updateEditorContents();
					}
				}
			}).done();
		};

		File.prototype.close = function() {
			var file = this,
				close = function() {
					fileSystem.deleteFile(file.id);
					fileMenu.removeItem(file.id);
					cache.removeFile(file.id);
				};

			if (file.hasTempChanges()) {
				confirm("Save changes before closing?", confirm.TERNARY_CHOICE)
					.then(function(value) {
						if (value == "yes") {
							return file.save().catch(function(reason) {
								if (reason != fileSystem.USER_CLOSED_DIALOG_REJECTION_MSG) throw reason;
							});
						}
					})
					.then(close)
					.catch(function(reason) {
						if (reason != confirm.REJECTION_MSG) throw reason;
					})
					.done();
			} else {
				close();
			}
		};

		File.prototype.hasTempChanges = function() {
			return this.cache.tempContents != this.cache.origContents; // This is blazingly fast, however long the strings
		};

		File.prototype.save = function() {
			var file = this;

			if (file.isTempFile()) return file.saveAs();
			if (!file.hasTempChanges()) return Promise.reject(fileSystem.File.SAVE_REJECTION_MSG);

			return fileSystem.writeToEntry(file.entry, file.cache.tempContents)
				.then(function() {
					file.setCachedProp("origContents", file.cache.tempContents);
					fileMenu.updateItemChangesVisualCue(file);
				});
		};

		File.prototype.saveAs = function() {
			var file = this;

			return fileSystem.writeToNewEntry(file.cache.tempContents)
				.then(function(entry) {
					file.makePermanent(entry);
					fileMenu.updateItemName(file);
					file.setCachedProp("origContents", file.cache.tempContents);
					fileMenu.updateItemChangesVisualCue(file);
				});
		};

		File.prototype.setCachedProp = function(propKey, propVal) {
			cache.updateFileCachedProp(this.id, propKey, propVal);

			// Hijack saving the file's tempContents to check for a change
			if (propKey == "tempContents") fileMenu.updateItemChangesVisualCue(this);
		};

		File.SAVE_REJECTION_MSG = "No changes to save."

		var generateUniqueFileId = function() {
			var randId;

			do {
				randId = Math.floor(Math.random() * Math.pow(10, 10)).toString(36);
			} while (fileSystem.hasFile(randId));

			return randId;
		};

		return $.extend(fsMethods, fsConstants, {
			File: File
		});

	})();

	// Handle the display of file menu items
	// Mostly called from fileSystem
	var fileMenu = (function() {
		const SCROLLBY_STEP = 160;

		var el = $(".file-menu"),
			items = new Map(), // Map files' ids with their respective menu item objects
			activeItemId = null,
			areNavControlsVisible = false,
			navControlsTriggers = editor.buttonsContainers.find(".file-menu-control"),

			// File menu DOM elements (both the file menu itself and every menu item) actually contain two DOM elements.
			// When scrolling, we only want to work with the visible one: that's what this method is for.
			getVisibleDOMEl = function($el) {
				return editor.isFullscreen? $el[1] : $el[0];
			},

			fileMenuMethods = {
				init: function() {
					this.updateNavControlsVis();
					this.initBindings();
				},

				initBindings: function() {
					el.on({
						"click dblclick": function(e) {
							e.preventDefault();
							var className = e.target.className.trim().split(" ")[0]; // Get the first class

							switch (e.type +" on ."+ className) {
								case "click on .file-menu-item":
									fileMenu.switchToItem($(e.target).data("id"));
									break;
								case "click on .close":
									var id = $(e.target).closest(".file-menu-item").data("id");
									fileSystem.getFile(id).close();
									break;
								case "dblclick on .file-menu":
									fileSystem.chooseNewTempFile();
									break;
							}
						},

						wheel: fileMenu.controlNav.bind(fileMenu, "vertical-scroll")
					});

					$window.on("resize", function() {
						fileMenu.updateNavControlsVis();
						fileMenu.scrollActiveItemIntoView();
					});

					editor.body.on("fullscreen.editor", function() {
						fileMenu.updateNavControlsVis();
						fileMenu.scrollActiveItemIntoView();
					});

					navControlsTriggers.on("click", function(e) {
						e.preventDefault();
						fileMenu.controlNav($(this).data("fileMenuControl"));
					});

					shortcutManager.register("CTRL + TAB", function(e) {
						e.preventDefault();
						fileMenu.controlNav("jump-right");
					});

					shortcutManager.register("CTRL + SHIFT + TAB", function(e) {
						e.preventDefault();
						fileMenu.controlNav("jump-left");
					});

					shortcutManager.register(["CTRL + 1", "CTRL + 2", "CTRL + 3", "CTRL + 4", "CTRL + 5", "CTRL + 6", "CTRL + 7", "CTRL + 8", "CTRL + 9"], function(e) {
						e.preventDefault();
						fileMenu.controlNav("jump-number", e);
					});
				},

				addItem: function(file) {
					var menuItemEl = $(this.generateItemMarkup()).data("id", file.id);
					this.updateItemNameEl(menuItemEl, file.name);

					this.setItem(file.id, {
						el: menuItemEl.appendTo(el),
						visualCues: {
							hasTempChanges: false
						}
					});

					this.updateNavControlsVis();
				},
				
				updateItemName: function(file) {
					this.updateItemNameEl(this.getItem(file.id).el, file.name);
					this.updateNavControlsVis();
					this.scrollActiveItemIntoView();
				},

				updateItemNameEl: function(menuItemEl, name) {
					var shortName = limitStrLen(name, 35);

					menuItemEl
						.attr("title", (name != shortName)? name : "")
						.children(".filename")
							.text(shortName);
				},
				
				updateItemChangesVisualCue: function(file) {
					var menuItem = this.getItem(file.id),
						hadTempChanges = menuItem.visualCues.hasTempChanges;

					menuItem.visualCues.hasTempChanges = file.hasTempChanges();

					if (hadTempChanges != menuItem.visualCues.hasTempChanges) menuItem.el.toggleClass("has-changed", menuItem.visualCues.hasTempChanges);
				},

				removeItem: function(id) {
					var menuItem = this.getItem(id),
						isSwitchingTabsNeeded = id == this.activeItemId;

					menuItem.el.remove();
					this.deleteItem(id);

					this.updateNavControlsVis();

					if (isSwitchingTabsNeeded) this.switchToItem(fileSystem.getClosestOpenFileId(id));
				},

				generateItemMarkup: function() {
					return [
						"<div class=\"file-menu-item\">",
							"<span class=\"filename\"></span>",
							"<span class=\"close\">×</span>",
						"</div>"
					].join("");
				},

				// Switch between open files
				// If id is falsy or doesn't match, defaults to the last open file
				switchToItem: function(id) {
					if (!id || !fileSystem.hasFile(id)) {
						id = fileSystem.getLastOpenFileId();
					}

					if (id == this.activeItemId) return;

					console.log("fileMenu items", items);

					this.forEachItem(function(menuItem, itemId) {
						if (id == itemId) {
							fileMenu.activeItemId = id;
							app.save("activeFileMenuItemId", id);

							menuItem.el.addClass("active");
							fileSystem.getFile(id).loadInEditor();
						} else {
							menuItem.el.removeClass("active");
						}
					});

					this.scrollActiveItemIntoView();
				},

				// Element.scrollIntoView() didn't do exactly what was wanted here
				scrollActiveItemIntoView: function() {
					if (!this.activeItemId) return;

					var fileMenuEl = getVisibleDOMEl(el),
						menuItemEl = getVisibleDOMEl(this.getItem(this.activeItemId).el),
						fileMenuElScrollLeft = fileMenuEl.scrollLeft,
						menuItemElOffsetLeft = menuItemEl.offsetLeft;
					
					// Align to left
					if (fileMenuElScrollLeft > menuItemElOffsetLeft) {
						fileMenuEl.scrollLeft = menuItemElOffsetLeft;
						return;
					}

					// Or align to right
					var fileMenuElOffsetWidth = fileMenuEl.offsetWidth,
						menuItemElOffsetWidth = menuItemEl.offsetWidth,
						diff = (menuItemElOffsetLeft + menuItemElOffsetWidth) - (fileMenuElScrollLeft + fileMenuElOffsetWidth);
					if (diff > 0) fileMenuEl.scrollLeft += diff;

					// Or do nothing
				},

				updateNavControlsVis: function() {
					var fileMenuEl = getVisibleDOMEl(el),
						shouldNavControlsBeVisible = fileMenuEl.scrollWidth > fileMenuEl.offsetWidth;

					if (shouldNavControlsBeVisible == areNavControlsVisible) return;

					editor.buttonsContainers.toggleClass("show-file-menu-controls", shouldNavControlsBeVisible);
					areNavControlsVisible = shouldNavControlsBeVisible;
				},

				controlNav: function(action, e) {
					switch (action) {
						case "vertical-scroll":
							this.hScroll(e);
							break;
						case "scroll-left":
							this.scrollBy(-SCROLLBY_STEP);
							break;
						case "scroll-right":
							this.scrollBy(SCROLLBY_STEP);
							break;
						case "jump-left":
							this.switchToItem(fileSystem.getPrevOpenFileId(this.activeItemId));
							break;
						case "jump-right":
							this.switchToItem(fileSystem.getNextOpenFileId(this.activeItemId));
							break;
						case "jump-number":
							var openFileId,
								number = e.originalEvent.keyCode,
								openFileIdIndexMap = new Map([
									[keyCode[1], 1],
									[keyCode[2], 2],
									[keyCode[3], 3],
									[keyCode[4], 4],
									[keyCode[5], 5],
									[keyCode[6], 6],
									[keyCode[7], 7],
									[keyCode[8], 8]
								]);

							if (openFileIdIndexMap.has(number)) openFileId = fileSystem.getOpenFileIdAtIndex(openFileIdIndexMap.get(number) - 1); // If jump to number 1-8, jump to corresponding tab
								else openFileId = fileSystem.getLastOpenFileId(); // If jump to number 9, jump to last tab

							if (openFileId) this.switchToItem(openFileId);
							break;
					}
				},

				// When a vertical wheel event is fired, transform it into horizontal scrolling
				hScroll: function(e) {
					e = e.originalEvent;

					if (e.deltaX || e.deltaZ) return;

					this.scrollBy(e.deltaY); // Units are always px since Chrome only uses e.deltaMode == WheelEvent.DOM_DELTA_PIXEL (see https://code.google.com/p/chromium/issues/detail?id=227454#c23)
					
				},

				scrollBy: function(x) {
					getVisibleDOMEl(el).scrollLeft += x;
				},

				setItem: items.set.bind(items),
				getItem: items.get.bind(items),
				deleteItem: items.delete.bind(items),
				forEachItem: items.forEach.bind(items)
			};



		return $.extend(fileMenuMethods, {
			activeItemId: activeItemId
		});
	})();

	app.init();

});