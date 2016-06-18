import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes, ModalTypes } from '../constants/AppConstants';
import ModalActionCreators from '../action-creators/ModalActionCreators';

const FileActionCreators = {
  updateEditorState: (editorState) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.EDITOR_STATE_UPDATED,
      editorState,
    });
  },

  moveFocusToEnd: () => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.EDITOR_MOVE_FOCUS_TO_END,
    });
  },

  appendToMarkdownSource: (markdown) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.APPEND_TO_MARKDOWN_SOURCE,
      markdown,
    });
  },

  updateActiveFile: (file) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.UPDATE_ACTIVE_FILE,
      file,
    });
  },

  closeFile: (file, shouldForceClose = false) => {
    const isFileEmpty = !file.editorState.getCurrentContent().hasText();

    if (!isFileEmpty && !shouldForceClose) {
      ModalActionCreators.openModal(ModalTypes.CONFIRM_CLOSE_NON_EMPTY_FILE, { file });
      return;
    }

    AppDispatcher.dispatch({
      actionType: ActionTypes.CLOSE_FILE,
      file,
    });
  },

  createAndSelectNewFile: () => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.CREATE_AND_SELECT_NEW_FILE,
    });
  },
};

export default FileActionCreators;
