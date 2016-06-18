import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes } from '../constants/AppConstants';
import { EditorState, SelectionState, Modifier, convertToRaw, convertFromRaw } from 'draft-js';
import createPersistentStore from '../utils/createPersistentStore';
import { generateUniqueId } from '../utils/StringUtils';

const CHANGE_EVENT = 'change';

const state = {
  files: [],
  activeFile: null,
};

const getNewFile = () => {
  const existingFileIds = state.files.map((file) => file.id);

  return {
    id: generateUniqueId(existingFileIds),
    name: null,
    editorState: EditorState.createEmpty(),
  };
};

const FileStore = Object.assign({}, EventEmitter.prototype, {
  emitChange: () => FileStore.emit(CHANGE_EVENT),
  addChangeListener: (callback) => FileStore.on(CHANGE_EVENT, callback),
  removeChangeListener: (callback) => FileStore.removeListener(CHANGE_EVENT, callback),

  getState: () => state,

  getPersistedState: () => ({
    files: state.files.map(({ id, name, editorState }) => {
      const rawEditorContentState = convertToRaw(editorState.getCurrentContent());
      const selection = editorState.getSelection();
      const rawSelection = {
        anchorKey: selection.getAnchorKey(),
        anchorOffset: selection.getAnchorOffset(),
        focusKey: selection.getFocusKey(),
        focusOffset: selection.getFocusOffset(),
      };

      return { id, name, rawEditorContentState, rawSelection };
    }),

    activeFileId: state.activeFile.id,
  }),

  setPersistedState: (persistedState) => {
    const restoredFiles = persistedState.files.map((file) => {
      const { id, name, rawEditorContentState, rawSelection } = file;
      const selectionState = new SelectionState({ ...rawSelection });

      let editorState = EditorState.createWithContent(convertFromRaw(rawEditorContentState));
      editorState = EditorState.set(editorState, { selection: selectionState });

      return { id, name, editorState };
    });

    state.files = restoredFiles;

    const activeFile = restoredFiles.find((file) => file.id === persistedState.activeFileId);
    updateActiveFile(activeFile);
  },

});

const updateEditorState = (editorState) => {
  state.activeFile.editorState = editorState;
};

const moveEditorFocusToEnd = () => {
  const newEditorState = EditorState.moveFocusToEnd(state.activeFile.editorState);
  state.activeFile.editorState = newEditorState;
};

const appendToMarkdownSource = (markdown) => {
  const editorState = state.activeFile.editorState;
  const contentState = editorState.getCurrentContent();
  const lastContentBlock = contentState.getLastBlock();
  const lastBlockKey = lastContentBlock.getKey();
  const blockLength = lastContentBlock.getLength();

  const targetRange = new SelectionState({
    anchorKey: lastBlockKey,
    anchorOffset: blockLength,
    focusKey: lastBlockKey,
    focusOffset: blockLength,
  });

  let newContentState = Modifier.insertText(contentState, targetRange, markdown);
  let newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');

  newEditorState = EditorState.moveFocusToEnd(newEditorState);
  newContentState = newContentState.merge({
    selectionBefore: contentState.getSelectionAfter(),
    selectionAfter: newEditorState.getSelection(),
  });

  newEditorState = EditorState.set(newEditorState, {
    currentContent: newContentState,
  });

  state.activeFile.editorState = newEditorState;
};

const updateActiveFile = (file) => {
  state.activeFile = file;
  state.activeFile.editorState = EditorState.forceSelection(
    state.activeFile.editorState,
    state.activeFile.editorState.getSelection(),
  );
};

const createFile = () => {
  const newFile = getNewFile();
  state.files.push(newFile);
  return newFile;
};

const createAndSelectNewFile = () => {
  const newFile = createFile();
  updateActiveFile(newFile);
};

const closeFile = (file) => {
  // Remove file from state
  const fileIndex = state.files.indexOf(file);
  state.files.splice(fileIndex, 1);

  // Make sure at least one file is always open
  if (state.files.length === 0) createFile();

  // If the file that was just closed was active, make the next/prev one active
  if (state.activeFile === file) {
    const maxFileIndex = state.files.length - 1;
    const newActiveFileIndex =
      (fileIndex <= maxFileIndex) ? fileIndex : fileIndex - 1;

    updateActiveFile(state.files[newActiveFileIndex]);
  }
};

const onDispatchedPayload = (payload) => {
  let isPayloadInteresting = true;

  switch (payload.actionType) {
    case ActionTypes.EDITOR_STATE_UPDATED:
      updateEditorState(payload.editorState);
      break;

    case ActionTypes.EDITOR_MOVE_FOCUS_TO_END:
      moveEditorFocusToEnd();
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
