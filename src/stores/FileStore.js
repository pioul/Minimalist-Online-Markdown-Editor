import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes } from '../constants/AppConstants';
import FileActionCreators from '../action-creators/FileActionCreators';
import createPersistentStore from '../utils/createPersistentStore';
import { generateUniqueId } from '../utils/StringUtils';

var CHANGE_EVENT = 'change';

var state = {
  files: [],
  activeFile: null,
};

var getNewFile = () => {
  var existingFileIds = state.files.map((file) => file.id);

  return {
    id: generateUniqueId(existingFileIds),
    name: null,
    markdown: '',
    html: '',
    caretPos: [0, 0],
  };
};

var FileStore = Object.assign({}, EventEmitter.prototype, {
  emitChange: () => FileStore.emit(CHANGE_EVENT),
  addChangeListener: (callback) => FileStore.on(CHANGE_EVENT, callback),
  removeChangeListener: (callback) => FileStore.removeListener(CHANGE_EVENT, callback),

  getState: () => state,

  getPersistedState: () => ({
    files: state.files,
    activeFileId: state.activeFile.id,
  }),

  setPersistedState: (persistedState) => {
    state = {
      files: persistedState.files,
      activeFile: persistedState.files.find((file) => file.id === persistedState.activeFileId),
    };
  },

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

var createFile = () => state.files.push(getNewFile());

var createAndSelectNewFile = () => {
  createFile();
  state.activeFile = state.files[state.files.length - 1];
};

var closeFile = (file) => {
  // Remove file from state
  var fileIndex = state.files.indexOf(file);
  state.files.splice(fileIndex, 1);

  // Make sure at least one file is always open
  if (state.files.length === 0) createFile();

  // If the file that was just closed was active, make the next/prev one active
  if (state.activeFile === file) {
    const maxFileIndex = state.files.length - 1;
    const newActiveFileIndex =
      (fileIndex <= maxFileIndex) ? fileIndex : fileIndex - 1;

    state.activeFile = state.files[newActiveFileIndex];
  }
};

var onDispatchedPayload = (payload) => {
  var isPayloadInteresting = true;

  switch (payload.actionType) {
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

createAndSelectNewFile(); // Init with an empty file

AppDispatcher.register(onDispatchedPayload);

export default createPersistentStore(FileStore, 'file-state');
