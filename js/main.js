var app;

$document.ready(function() {
	"use strict";

	app = {

		// Chrome app variables
		fileMenuEl: $(".file-menu"),
		markdownPreviewIframe: $("#preview-iframe"),
		isMarkdownPreviewIframeLoaded: false,
		markdownPreviewIframeLoadEventCallbacks: $.Callbacks(),

		init: function() {
			editor.init();
			this.initBindings();
			this.initFSBindings();
			fileMenu.initBindings();
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
				},

				keydown: function(e) {
					if (!e.ctrlKey) return;
					var toDo;

					switch(e.keyCode) {
						case keyCode.N: // CTRL + N
							toDo = function() {
								e.preventDefault();
								fileSystem.chooseNewTempFile();
							};
							break;
						case keyCode.O: // CTRL + O
							toDo = function() {
								e.preventDefault();
								fileSystem.chooseEntries();
							};
							break;
						case keyCode.S: // CTRL + S
							toDo = function() {
								e.preventDefault();
								var file = fileSystem.getFile(fileMenu.activeItemId);

								if (e.shiftKey) file.saveAs().then(function() { console.log("SAVEAS SUCCESSFUL", fileSystem.getFile(fileMenu.activeItemId), arguments)}, function() { console.log("SAVEAS UNSUCCESSFUL", fileSystem.getFile(fileMenu.activeItemId), arguments)}).done();
									else file.save().then(function() { console.log("SAVE SUCCESSFUL", fileSystem.getFile(fileMenu.activeItemId), arguments)}, function() { console.log("SAVE UNSUCCESSFUL", fileSystem.getFile(fileMenu.activeItemId), arguments)}).done();
							};
							break;
						case keyCode.W: // CTRL + W
							toDo = function() {
								e.preventDefault();
								fileSystem.getFile(fileMenu.activeItemId).close();
							};
							break;
					}

					if (toDo) Modal.ifNoModalOpen().then(toDo).catch(function() { e.preventDefault() }).done();
				}
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
		// This method can be called in place of editor.save to save things from /editor, or directly for key/value storage
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

					// Shouldn't be called directly: abstracted as fileSystem.getLastOpenFileId()
					getLastOpenFileId: function() {
						return openFilesIds[openFilesIds.length - 1];
					},

					// Shouldn't be called directly: abstracted as fileSystem.getClosestOpenFileId()
					// Return the id of the closest open file, ideally the next one, or the prev one if none to the right, or null
					getClosestOpenFileId: function(id) {
						var openFileIdIndex = openFilesIds.indexOf(id);

						if (openFileIdIndex == -1 || openFilesIds.length <= 1) return null; // No open file other than this one
						if (openFileIdIndex >= openFilesIds.length - 1) return openFilesIds[--openFileIdIndex]; // No open file next, return previous file id instead

						return openFilesIds[++openFileIdIndex]; // There's an open file next, return its id
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
									console.log("failed writing to file");
									rejectPromise();
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
								if (typeof writableEntry == "undefined") { rejectPromise(); return; } // undefined when user closes dialog

								writableEntry.createWriter(function(writer) {
									writer.onerror = function() {
										console.log("failed writing to file");
										rejectPromise();
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

				getLastOpenFileId: cache.getLastOpenFileId.bind(cache),
				getClosestOpenFileId: cache.getClosestOpenFileId.bind(cache),

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
				pastOrigContents = file.cache.origContents;

			file.read().then(function(fileContents) {
				if (fileContents != pastOrigContents) {
					let updateEditorContents = function() {
						editor.updateMarkdownSource(fileContssents);
					};

					if (file.hasTempChanges()) confirm("The file has changed on disk. Reload it?").then(updateEditorContents, fileMenu.updateItemChangesVisualCue.bind(fileMenu, file)).done();
						else updateEditorContents();
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
						if (value == "yes") return file.save();
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

			if (!file.hasTempChanges()) return Promise.reject();
			if (file.isTempFile()) return file.saveAs();

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

		var generateUniqueFileId = function() {
			var randId;

			do {
				randId = Math.floor(Math.random() * Math.pow(10, 10)).toString(36);
				console.log("rand");
			} while (fileSystem.hasFile(randId));

			return randId;
		};

		return $.extend(fsMethods, {
			File: File
		});

	})();

	// Handle the display of file menu items
	// Mostly called from fileSystem
	var fileMenu = (function() {
		var items = new Map(), // Map files' ids with their respective menu item objects
			activeItemId = null,

			fileMenuMethods = {
				initBindings: function() {
					app.fileMenuEl.on("click dblclick", function(e) {
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
					});
				},

				addItem: function(file) {
					this.setItem(file.id, {
						el: $(this.generateItemMarkup(file)).prependTo(app.fileMenuEl).data("id", file.id),
						visualCues: {
							hasTempChanges: false
						}
					});
				},
				
				updateItemName: function(file) {
					var menuItem = this.getItem(file.id);
					menuItem.el.children(".filename").text(file.name);
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

					if (isSwitchingTabsNeeded) this.switchToItem(fileSystem.getClosestOpenFileId(id));
				},

				generateItemMarkup: function(file) {
					return [
						"<div class=\"file-menu-item\">",
							"<span class=\"filename\">"+ escapeHTML(file.name) +"</span>",
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