var app;

$document.ready(function() {
	"use strict";

	app = {

		// Chrome app variables
		markdownPreviewIframe: $("#preview-iframe"),
		dragMask: document.getElementById("drag-mask"),
		isMarkdownPreviewIframeLoaded: false,
		markdownPreviewIframeLoadEventCallbacks: $.Callbacks(),

		init: function() {
			editor.init();
			this.initBindings();
			fileSystem.initBindings();
			fileMenu.init();
			UndoManager.initBindings();
		},

		initBindings: function() {
			$window.on({
				message: app.receiveMessage.bind(app),
				focus: app.checkActiveFileForChanges.bind(app),
				"close.modal": app.focusMarkdownSource.bind(app)
			});

			// In the Chrome app, the preview panel requires to be in a sandboxed iframe, hence isn't loaded immediately with the rest of the document
			this.markdownPreviewIframe.on("load", function() {
				app.isMarkdownPreviewIframeLoaded = true;
				app.markdownPreviewIframeLoadEventCallbacks.fire();
			});
		},

		// Post messages to the iframe
		postMessage: function(data) {
			this.markdownPreviewIframe[0].contentWindow.postMessage(data, "*");
		},

		// Receive messages sent to this window (from the iframe)
		receiveMessage: function(e) {
			var data = e.originalEvent.data;
			
			if (data.hasOwnProperty("height")) this.updateMarkdownPreviewIframeHeight(data.height, data.isAfterUserInput);
			if (data.hasOwnProperty("text")) editor.updateWordCount(data.text);
			if (data.keydownEventObj) this.markdownPreviewIframe.trigger(data.keydownEventObj);
			if (data.hasOwnProperty("scrollMarkdownPreviewIntoViewAtOffset")) this.scrollMarkdownPreviewIntoViewAtOffset(data.scrollMarkdownPreviewIntoViewAtOffset);
		},

		focusMarkdownSource: function() {
			setTimeout(function() {
				editor.markdownSource.focus();
			}, 0);
		},

		// Save a key/value pair in chrome.storage (either Markdown text or enabled features)
		// This method can be called from editor.save() to save things from /editor, or directly for key/value storage
		// It must thus allow for two types of usage: replication of usage from editor.save, and app-specific storage
		// And, the Chrome app allowing multiple files and tabs to be open at once (while the basic editor doesn't), 
		// the key/value pair has to be transformed to a more complex format when key == "markdown"
		save: function(key, value) {
			// Hijack saving to convert the key/value pair to a more complex format
			if (key == "markdown") {
				let file = fileSystem.getActiveFile(),
					caretPos = editor.getMarkdownSourceCaretPos();

				file.undoManager.save(file.cache.tempContents, value, file.cache.caretPos, caretPos);
				file.cache.tempContents = value;
				file.cache.caretPos = caretPos;
				fileMenu.updateItemChangesVisualCue(file);

				return;
			}

			var items = {};
			items[key] = value;

			chrome.storage.local.set(items);
		},

		// Restore the editor's state from chrome.storage (saved Markdown and enabled features)
		restoreState: function(callback) {
			// restoreState needs the preview panel to be loaded: if it isn't loaded when restoreState is called, call restoreState again as soon as it is
			if (!this.isMarkdownPreviewIframeLoaded) {
				this.markdownPreviewIframeLoadEventCallbacks.add(function() {
					app.restoreState(callback);
				});

				return;
			}

			var editorRestoredItems,

				tryRunningCallback = (function() {
					var expectedTries = 2;

					return function() {
						if (!--expectedTries) callback(editorRestoredItems);
					};
				})();

			// Retrieve locally stored data to be sent to editor
			// For the same reason the "markdown" key is hijacked when saving the editor's contents, it's not included here so that the app can handle the restoration of the editor's contents itself
			chrome.storage.local.get(["isSyncScrollDisabled", "isFullscreen", "activePanel"], function(restoredItems) {
				editorRestoredItems = restoredItems;
				tryRunningCallback();
			});

			// Retrieve locally stored data to be handled by the app.
			// Restore "openFilesIds", "filesCache" and "activeFileMenuItemId", in that order and while making sure the previous item has been restored before restoring the next.
			// Also try to restore "markdown" to update from an old version of the app that used the "markdown" key to store its contents.
			chrome.storage.local.get(["openFilesIds", "filesCache", "activeFileMenuItemId", "markdown"], function(restoredItems) {
				if (restoredItems.openFilesIds) fileSystem.restoreFiles(restoredItems.openFilesIds);
				if (restoredItems.filesCache) fileSystem.cache.restoreFilesCachedProps(restoredItems.filesCache);

				// First app launch (otherwise at least one temp file is already open)
				if (fileSystem.isEmpty()) {
					fileSystem.chooseNewTempFile();

					let populateNewFile = function(text) {
						fileSystem.getActiveFile().undoManager.freeze();
						editor.updateMarkdownSource(text);
						fileSystem.getActiveFile().undoManager.unfreeze();
					};

					// Updated from version < 3.0.0 of the editor: populate the new file with the old version's saved contents, and delete that key
					if (restoredItems.markdown) {
						populateNewFile(restoredItems.markdown);
						chrome.storage.local.remove("markdown");
					// Fresh new install: populate the new file with welcome instructions
					} else {
						let welcomeMsg = [
							"# Minimalist Markdown Editor",
							"",
							"This is the **simplest** and **slickest** Markdown editor.  ",
							"Just write Markdown and see what it looks like as you type. And convert it to HTML in one click.",
							"",
							"## Getting started",
							"",
							"### How?",
							"",
							"Just start typing in the left panel.",
							"",
							"### Buttons you might want to use",
							"",
							"- **Quick Reference**: that's a reminder of the most basic rules of Markdown",
							"- **HTML | Preview**: *HTML* to see the markup generated from your Markdown text, *Preview* to see how it looks like",
							"",
							"### Most useful shortcuts",
							"",
							"- `CTRL + O` to open files",
							"- `CTRL + T` to open a new tab",
							"- `CTRL + S` to save the current file or tab",
							"",
							"### Privacy",
							"",
							"- No data is sent to any server – everything you type stays inside your application",
							"- The editor automatically saves what you write locally for future use.  ",
							"  If using a public computer, close all tabs before leaving the editor"
						].join("\n");
						
						populateNewFile(welcomeMsg);
					}
				}

				fileMenu.switchToItem(restoredItems.activeFileMenuItemId);
				tryRunningCallback();
			});
		},

		// Update the preview panel with new HTML
		updateMarkdownPreview: function(html, isAfterUserInput) {
			this.postMessage({
				html: html,
				isAfterUserInput: isAfterUserInput
			});
		},

		updateMarkdownPreviewIframeHeight: function(height, isAfterUserInput) {
			this.markdownPreviewIframe.css("height", height);
			editor.triggerEditorUpdatedEvent(isAfterUserInput);
		},

		scrollMarkdownPreviewCaretIntoView: function() {
			// The active file's cached caret pos isn't used here since that cache is only updated when the 
			// Markdown source is – and this use case requires the freshest pos available.
			var caretPos = editor.getMarkdownSourceCaretPos();
			if (!caretPos) return;

			this.postMessage({
				scrollLineIntoView: editor.getMarkdownSourceLineFromPos(caretPos),
				lineCount: editor.getMarkdownSourceLineCount()
			});
		},

		scrollMarkdownPreviewIntoViewAtOffset: (function() {
			var param = {
				ref: editor.markdownPreview[0],
				padding: 40
			};

			return function(offsets) {
				param.elOffsets = offsets;
				scrollIntoView(param);
			};
		})(),

		// Automatically check whether the active file has changed when the app window regains focus
		checkActiveFileForChanges: function() {
			var activeFile = fileSystem.getActiveFile();
			if (!activeFile.isTempFile()) activeFile.checkDiskContents();
		}

	};

	// MME's file system
	// Handles I/O with the real FS, but also takes care of much more files-related stuff
	var fileSystem = (function() {

		var files = new Map(),
			entriesDisplayPathsMap = new Map(), // Maps permanent files' entries' display paths with their ids

			// fileSystem.cache takes care of saving things to persist them between sessions even if the user didn't explicitly ask to
			// fileSystem.cache saves only a subset of the files' properties, that is the enumerable props of FileCache instances
			// fileSystem saves to chrome.fileSystem, fileSystem.cache saves to chrome.storage.local
			// Files maintain a reference to their cache, and cached props must be read and set through their "public" properties, that is
			// the ones exposed in their prototype: set and get using e.g. file.cache.tempContents rather than file.cache._tempContents
			cache = (function() {
				var openFilesIds = [], // Stores files' ids, and their sorting order
					filesCache = {}; // Stores additional properties for files, mapped to the files' ids

				var FileCache = function() {
						this._entryId = null;
						this._origContents = "";
						this._tempContents = "";
						this._caretPos = { start: 0, end: 0 };
					},

					setFileCacheProp = function(name, val) {
						this[name] = val;
						cache.save(cache.saveThe.filesCache);
					};

				Object.defineProperties(FileCache.prototype, {
					entryId: {
						enumerable: true,
						get: function() { return this._entryId },
						set: function(newVal) { setFileCacheProp.call(this, "_entryId", newVal) }
					},

					origContents: {
						enumerable: true,
						get: function() { return this._origContents },
						set: function(newVal) { setFileCacheProp.call(this, "_origContents", newVal) }
					},

					tempContents: {
						enumerable: true,
						get: function() { return this._tempContents },
						set: function(newVal) { setFileCacheProp.call(this, "_tempContents", newVal) }
					},

					caretPos: {
						enumerable: true,
						get: function() { return this._caretPos },
						set: function(newVal) { setFileCacheProp.call(this, "_caretPos", newVal) }
					}
				});

				return {
					addFile: function(id) {
						openFilesIds.push(id);

						var fileCache = new FileCache();
						filesCache[id] = fileCache;
						
						this.save();

						return fileCache;
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
										if (propKey == "_entryId" && propVal != null) {
											chrome.fileSystem.restoreEntry(propVal, function(entry) {
												if (typeof entry != "undefined") {
													file.makePermanent(entry).done();
													fileMenu.updateItemName(file);
												}
											});

											continue;
										}

										file.cache[propKey] = propVal;
									}
								}

								fileMenu.updateItemChangesVisualCue(file);
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
				initBindings: function() {
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
						
						var file = fileSystem.getActiveFile();
						file.save()
							.catch(function(reason) {
								if ([fileSystem.File.SAVE_REJECTION_MSG, fileSystem.USER_CLOSED_DIALOG_REJECTION_MSG].indexOf(reason) == -1) throw reason;
							})
							.done();
					});

					shortcutManager.register("CTRL + SHIFT + S", function(e) {
						e.preventDefault();

						var file = fileSystem.getActiveFile();
						file.saveAs()
							.catch(function(reason) {
								if (reason != fileSystem.USER_CLOSED_DIALOG_REJECTION_MSG) throw reason;
							})
							.done();
					});

					shortcutManager.register(["CTRL + W", "CTRL + F4"], function(e) {
						e.preventDefault();
						fileSystem.getActiveFile().close();
					});

					editor.body.on("dragenter dragover dragleave drop", fileSystem.dndHandler.bind(fileSystem));
				},

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

							fileSystem.importEntries(entries);
						}
					);
				},

				// Drag & drop events handler
				dndHandler: (function() {
					var isDragging = false,

						onDragEnd = function(e) {
							if (!isDragging || e.target != app.dragMask) return;

							app.dragMask.classList.remove("visible");
							isDragging = false;
						},

						isValidDtType = function(e) {
							return e.originalEvent.dataTransfer.types.indexOf("Files") != -1;
						};

					return function(e) {
						switch(e.type) {
							case "dragenter":
								if (isDragging || !isValidDtType(e)) return;

								app.dragMask.classList.add("visible");
								isDragging = true;
								break;

							case "dragover":
								if (isValidDtType(e)) e.preventDefault(); // Indicate the body is a valid drop target
								break;

							case "dragleave":
								onDragEnd(e);
								break;

							case "drop":
								onDragEnd(e);
								fileSystem.chooseEntriesByDrop(e);
								break;
						}
					};
				})(),

				chooseEntriesByDrop: function(e) {
					var dt = e.originalEvent.dataTransfer;

					if (dt.types.indexOf("Files") == -1) return;
					
					e.preventDefault();
					var entries = [];

					for (let i = 0, dtItem; dtItem = dt.items[i]; i++) {
						// Only accept files that are some type of text (most commonly "text/plain") or of unknown type (such as .md as of today)
						if (dtItem.kind != "file" || dtItem.type && dtItem.type.indexOf("text/") != 0) continue;

						entries.push(dtItem.webkitGetAsEntry());
					}

					fileSystem.importEntries(entries);
				},

				// Transform entries into perm files, hence opening them into the editor
				importEntries: function(entries) {
					var promisedPermFilesBeingCreated = [],
						lastChosenAlreadyOpenFile = null,
						wereNewFilesSuccessfullyOpen = false;

					for (let i = 0, entry; entry = entries[i]; i++) {
						if (!entry.isFile) continue;

						let promise = fileSystem.getEntryDisplayPath(entry).then(function(displayPath) {
							var fileId = fileSystem.getEntriesDisplayPathsMap(displayPath);

							// If the display path has already been saved, hence the file has already been opened,
							// save that file's id in order to switch to the file's tab later if necessary.
							if (fileId) {
								lastChosenAlreadyOpenFile = fileId;
							} else {
								return fileSystem.createPermFile(entry).then(function() {
									wereNewFilesSuccessfullyOpen = true;
								});
							}
						});

						promisedPermFilesBeingCreated.push(promise);
					}

					// Switch to the latest open file. If the selected FS entries didn't result in any new file being open,
					// switch to the latest of the files that were both selected and already open.
					Promise.all(promisedPermFilesBeingCreated).then(function() {
						fileMenu.switchToItem(wereNewFilesSuccessfullyOpen? null : lastChosenAlreadyOpenFile);
					}).done();
				},

				// chrome.fileSystem.getDisplayPath doesn't work reliably with symlinks (see "Edge cases" in README.md)
				getEntryDisplayPath: function(entry) {
					return new Promise(function(resolvePromise) {
						chrome.fileSystem.getDisplayPath(entry, function(displayPath) {
							resolvePromise(displayPath);
						});
					});
				},

				writeToEntry: function(entry, text) {
					return new Promise(function(resolvePromise, rejectPromise) {
						chrome.fileSystem.getWritableEntry(entry, function(writableEntry) {
							var onError = function(error) {
								rejectPromise(error);
							};

							writableEntry.createWriter(function(writer) {
								writer.onerror = onError;

								writer.onwriteend = function() {
									var blob = new Blob([text]);

									writer.onwriteend = resolvePromise;
									writer.write(blob, {type: "text/plain"});
								};

								writer.truncate(0);
							}, onError);
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

								var onError = function(error) {
									rejectPromise(error);
								};

								writableEntry.createWriter(function(writer) {
									writer.onerror = onError;
									writer.onwriteend = resolvePromise.bind(null, writableEntry);

									writer.write(new Blob([text]), {type: "text/plain"});
								}, onError);
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

				createTempFile: function(id) {
					var file = new fileSystem.File(id);
					fileMenu.addItem(file);

					return file;
				},

				createPermFile: function(entry) {
					var file, promise;

					file = new fileSystem.File(generateUniqueFileId());
					promise = file.makePermanent(entry);

					promise = promise.then(function() {
						fileMenu.addItem(file);

						return file.read().then(function(fileContents) {
							var contentsLength = fileContents.length;

							file.cache.tempContents = fileContents;
							file.cache.caretPos = { start: contentsLength, end: contentsLength };
							fileMenu.updateItemChangesVisualCue(file);
						});
					});

					return promise;
				},

				isEmpty: function(id) { return !files.size },

				getActiveFile: function() {
					return this.getFile(fileMenu.activeItemId);
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

				setEntriesDisplayPathsMap: entriesDisplayPathsMap.set.bind(entriesDisplayPathsMap),
				getEntriesDisplayPathsMap: entriesDisplayPathsMap.get.bind(entriesDisplayPathsMap),
				deleteEntriesDisplayPathsMap: entriesDisplayPathsMap.delete.bind(entriesDisplayPathsMap)
			},

			fsConstants = {
				USER_CLOSED_DIALOG_REJECTION_MSG: "User closed dialog."
			},

			// A temporary file (one that's only stored in the cache, w/o being linked to the file system) is identified by this.isTempFile() == true
			// A permanent file has this.cache.entryId set to the fs entry id, this.entry to the entry itself, and this.isTempFile() == false
			File = function(id) {
				this.id = id;
				this.name = fileSystem.File.DEFAULT_NAME;
				this.cache = cache.addFile(this.id);
				this.undoManager = new UndoManager();
				fileSystem.setFile(this.id, this);
			};

		File.prototype.makePermanent = function(entry) {
			var file = this;

			file.cache.entryId = chrome.fileSystem.retainEntry(entry);
			file.entry = entry;
			file.name = entry.name;

			return fileSystem.getEntryDisplayPath(entry)
				.then(function(displayPath) {
					fileSystem.setEntriesDisplayPathsMap(displayPath, file.id);
					file.entryDisplayPath = displayPath;
				});
		};

		File.prototype.makeTemporary = function() {
			this.name = fileSystem.File.DEFAULT_NAME;
			this.cache.entryId = null;
			this.cache.origContents = "";
			fileSystem.deleteEntriesDisplayPathsMap(this.entryDisplayPath);
			delete this.entry;
			delete this.entryDisplayPath;
			fileMenu.updateItemName(this);
			fileMenu.updateItemChangesVisualCue(this);
		};

		File.prototype.isTempFile = function() { return !this.cache.entryId };

		File.prototype.read = function() {
			var file = this;

			return new Promise(function(resolvePromise, rejectPromise) {
				var text,
					reader = new FileReader(),

					onError = function(error) {
						rejectPromise(error);
					};

				reader.onload = function() {
					text = normalizeNewlines(reader.result);

					file.cache.origContents = text;
					resolvePromise(text);
				};

				reader.onerror = onError; // Currently passes one param, a FileError obj, that could change to be a DOMError obj

				file.entry.file(function(file) {
					reader.readAsText(file);
				}, onError);
			});
		};

		// Load the file's cached contents into the editor
		// Also read from the file to see if the cached contents are different from the file's
		// The file's undo manager is frozen because its contents won't change, while the editor's will: we don't these non-changes
		// to be saved when propagated from the editor
		File.prototype.loadInEditor = function() {
			this.undoManager.freeze();
			editor.updateMarkdownSource(this.cache.tempContents, this.cache.caretPos);
			this.undoManager.unfreeze();
			if (!this.isTempFile()) this.checkDiskContents();
		};

		// Read the file's contents from the disk, and if new content, update the cache and update the editor's contents.
		// (If the user has changed that file's contents in the editor in the meantime, ask him if he'd like to reload it from the fs.)
		// (If file file isn't found on the FS, offer to keep its contents, otherwise close it.)
		File.prototype.checkDiskContents = function() {
			var file = this,
				pastOrigContents = file.cache.origContents,
				fileHasTempChanges = file.hasTempChanges();

			file.read()
				.then(function(fileContents) {
					if (fileContents != pastOrigContents) {
						let updateEditorContents = function() {
							editor.updateMarkdownSource(fileContents);
						};

						if (fileHasTempChanges) {
							confirm("The file has changed on disk. Reload it?", [
								new confirm.Button(confirm.Button.CANCEL_BUTTON),
								new confirm.Button(confirm.Button.OK_BUTTON.extend({ text: "Reload" }))
							])
								.then(updateEditorContents)
								.catch(function(reason) {
									if (reason != confirm.REJECTION_MSG) throw reason;
								})
								.done();
						} else {
							updateEditorContents();
						}
					}
				})
				.catch(function(error) {
					if (error.name != "NotFoundError") throw error;

					confirm("Another program deleted that file. Keep its contents in the editor?", [
						new confirm.Button(confirm.Button.CANCEL_BUTTON.extend({ text: "Close the file" })),
						new confirm.Button(confirm.Button.OK_BUTTON.extend({ text: "Keep in editor" }))
					])
						.then(file.makeTemporary.bind(file))
						.catch(function(reason) {
							if (reason != confirm.REJECTION_MSG) throw reason;

							file.close();
						})
						.done();
				})
				.done();
		};

		File.prototype.close = function() {
			var file = this,
				close = function() {
					fileSystem.deleteFile(file.id);
					fileSystem.deleteEntriesDisplayPathsMap(file.entryDisplayPath);
					fileMenu.removeItem(file.id);
					cache.removeFile(file.id);
				};

			if (file.hasTempChanges()) {
				confirm("Save changes before closing?", [
					new confirm.Button(confirm.Button.CANCEL_BUTTON.extend({ text: "Don't close" })),
					new confirm.Button(confirm.Button.OK_BUTTON.extend({ text: "Discard", dataValue: "no" })),
					new confirm.Button(confirm.Button.OK_BUTTON.extend({ text: "Save changes", dataValue: "yes" }))
				])
					.then(function(value) {
						if (value == "yes") return file.save(); // Can throw fileSystem.USER_CLOSED_DIALOG_REJECTION_MSG if saveAs() is called and the "save as" dialog is closed
					})
					.then(close)
					.catch(function(reason) {
						if ([confirm.REJECTION_MSG, fileSystem.USER_CLOSED_DIALOG_REJECTION_MSG].indexOf(reason) == -1) throw reason;
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
					file.cache.origContents = file.cache.tempContents;
					fileMenu.updateItemChangesVisualCue(file);
				})
				.catch(function(reason) { // Unknown error: display "save failed" message, and rethrow error as if it was uncaught
					alert("Changes couldn't be saved to the file.");
					throw reason;
				});
		};

		File.prototype.saveAs = function() {
			var file = this;

			return fileSystem.writeToNewEntry(file.cache.tempContents)
				.then(function(entry) {
					file.cache.origContents = file.cache.tempContents;
					fileMenu.updateItemChangesVisualCue(file);

					return file.makePermanent(entry).then(function() {
						fileMenu.updateItemName(file);
					});
				})
				.catch(function(reason) {
					// Unknown error: display "save failed" message
					if (reason != fileSystem.USER_CLOSED_DIALOG_REJECTION_MSG) {
						alert("Changes couldn't be saved to the file.");
					}

					// Rethrow all errors as if theyre were uncaught
					throw reason;
				});
		};

		File.SAVE_REJECTION_MSG = "No changes to save.";
		File.GET_DISPLAY_PATH_REJECTION_MSG = "No display path: file is temporary.";
		File.DEFAULT_NAME = "untitled";

		var generateUniqueFileId = function() {
			var randId;

			do {
				randId = Math.floor(Math.random() * Math.pow(10, 10)).toString(36);
			} while (fileSystem.hasFile(randId));

			return randId;
		};

		return $.extend(fsMethods, fsConstants, {
			File: File,
			cache: cache
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

					shortcutManager.register(["CTRL + TAB", "CTRL + PGDOWN", "CTRL + ALT + ARROWRIGHT"], function(e) {
						e.preventDefault();
						fileMenu.controlNav("jump-right");
					});

					shortcutManager.register(["CTRL + SHIFT + TAB", "CTRL + PGUP", "CTRL + ALT + ARROWLEFT"], function(e) {
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

				scrollActiveItemIntoView: (function() {
					var param = {
						axis: "horizontal"
					};

					return function() {
						if (!this.activeItemId) return;

						param.ref = getVisibleDOMEl(el);
						param.el = getVisibleDOMEl(this.getItem(this.activeItemId).el);
						
						scrollIntoView(param);
					};
				})(),

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

	var UndoManager = (function() {
		var UndoManager = function() {
			this.stack = new Undo.Stack();
			this.isFrozen = false; // Freeze UndoManager instance when undoing/redoing to avoid polluting the stack
			this.saveData = {
				timer: null,
				firstOldVal: null,
				firstOldCaretPos: null
			};
		};

		UndoManager.initBindings = function() {
			shortcutManager.register("CTRL + Z", function(e) {
				e.preventDefault();
				fileSystem.getActiveFile().undoManager.undo();
			});

			shortcutManager.register(["CTRL + SHIFT + Z", "CTRL + Y"], function(e) {
				e.preventDefault();
				fileSystem.getActiveFile().undoManager.redo();
			});
		};

		UndoManager.prototype.save = function(oldVal, newVal, oldCaretPos, newCaretPos) {
			if (this.isFrozen) return;

			// Save oldVal through subsequent calls to save()
			if (this.saveData.firstOldVal === null) this.saveData.firstOldVal = oldVal;
				else oldVal = this.saveData.firstOldVal;

			// Save oldCaretPos through subsequent calls to save()
			if (this.saveData.firstOldCaretPos === null) this.saveData.firstOldCaretPos = oldCaretPos;
				else oldCaretPos = this.saveData.firstOldCaretPos;

			// Only save after 250 ms of inactivity
			clearTimeout(this.saveData.timer);
			this.saveData.timer = setTimeout(function() {
				this.stack.execute(new FileSaveCommand(oldVal, newVal, oldCaretPos, newCaretPos));
				this.saveData.firstOldVal = this.saveData.firstOldCaretPos = null;
			}.bind(this), 250);
		};

		UndoManager.prototype.undo = function() {
			if (this.stack.canUndo()) {
				this.freeze();
				this.stack.undo();
				this.unfreeze();
			}
		};

		UndoManager.prototype.redo = function() {
			if (this.stack.canRedo()) {
				this.freeze();
				this.stack.redo();
				this.unfreeze();
			}
		};

		UndoManager.prototype.freeze = function() {
			this.isFrozen = true;
		};

		UndoManager.prototype.unfreeze = function() {
			this.isFrozen = false;
		};

		var FileSaveCommand = Undo.Command.extend({
			constructor: function(oldVal, newVal, oldCaretPos, newCaretPos) {
				this.oldVal = oldVal;
				this.newVal = newVal;
				this.oldCaretPos = oldCaretPos;
				this.newCaretPos = newCaretPos;
			},

			execute: function() {},

			undo: function() {
				editor.updateMarkdownSource(this.oldVal, this.oldCaretPos, true);
			},
			
			redo: function() {
				editor.updateMarkdownSource(this.newVal, this.newCaretPos, true);
			}
		});

		return UndoManager;
	})();

	app.init();

});