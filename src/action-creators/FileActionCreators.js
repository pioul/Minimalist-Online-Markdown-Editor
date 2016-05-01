import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes, ModalTypes } from '../constants/AppConstants';
import MarkdownParser from '../utils/MarkdownParser';
import ModalActionCreators from '../action-creators/ModalActionCreators';

var FileActionCreators = {
  updateMarkdown: (md, caretPos) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.MARKDOWN_UPDATED,
      md,
      caretPos,
    });

    FileActionCreators.parseMarkdown(md);
  },

  parseMarkdown: (md) => {
    MarkdownParser.render(md)
      .then((html) => {
        AppDispatcher.dispatch({
          actionType: ActionTypes.MARKDOWN_PARSED,
          html,
        });
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
    var isFileEmpty = file.markdown.length === 0;

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
