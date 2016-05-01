import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes } from '../constants/AppConstants';
import FileActionCreators from '../action-creators/FileActionCreators';

var CHANGE_EVENT = 'change';

var getNewFile = () => ({
  name: null,
  markdown: '',
  html: '',
  caretPos: [0, 0]
});

var newFile = getNewFile(); // TODO: move init away from here

var state = {
  files: [
    newFile
  ],

  activeFile: newFile
};

var FileStore = Object.assign({}, EventEmitter.prototype, {
  emitChange: () => FileStore.emit(CHANGE_EVENT),
  addChangeListener: (callback) => FileStore.on(CHANGE_EVENT, callback),
  removeChangeListener: (callback) => FileStore.removeListener(CHANGE_EVENT, callback),

  getState: () => state
});

var updateMarkdown = (md, caretPos) => {
  state.activeFile.markdown = md;
  state.activeFile.caretPos = caretPos;
};

var updateHtml = (html) => state.activeFile.html = html;

var appendToMarkdownSource = (markdown) => {
  state.activeFile.markdown += markdown;
  state.activeFile.caretPos = [state.activeFile.markdown.length, state.activeFile.markdown.length];

  FileActionCreators.parseMarkdown(state.activeFile.markdown);
};

var updateActiveFile = (file) => state.activeFile = file;

var closeFile = (file) => {
  // Remove file from state
  var fileIndex = state.files.indexOf(file);
  state.files.splice(fileIndex, 1);

  // Make sure at least one file is always open
  if (state.files.length === 0) createFile();

  // If the file that was just closed was active, make the next/prev one active
  if (state.activeFile === file) {
    let maxFileIndex = state.files.length - 1;
    let newActiveFileIndex =
      (fileIndex <= maxFileIndex) ? fileIndex : fileIndex - 1;

    state.activeFile = state.files[newActiveFileIndex];
  }
};

var createFile = () => state.files.push(getNewFile());

var createAndSelectNewFile = () => {
  createFile();
  state.activeFile = state.files[state.files.length - 1];
};

var onDispatchedPayload = (payload) => {
  var isPayloadInteresting = true;

  switch(payload.actionType) {
    case ActionTypes.MARKDOWN_UPDATED:
      updateMarkdown(payload.md, payload.caretPos);
      break;

    case ActionTypes.MARKDOWN_PARSED:
      updateHtml(payload.html);
      break;

    case ActionTypes.APPEND_TO_MARKDOWN_SOURCE:
      appendToMarkdownSource(payload.markdown);
      break;

    case ActionTypes.UPDATE_ACTIVE_FILE:
      updateActiveFile(payload.file);
      break;

    case ActionTypes.CLOSE_FILE:
      closeFile(payload.file);
      break;

    case ActionTypes.CREATE_AND_SELECT_NEW_FILE:
      createAndSelectNewFile(payload.file);
      break;

    default:
      isPayloadInteresting = false;
      break;
  }

  if (isPayloadInteresting) FileStore.emitChange();
};

AppDispatcher.register(onDispatchedPayload);

export default FileStore;
