import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes } from '../constants/AppConstants';
import MarkdownParser from '../utils/MarkdownParser';

var FileActionCreators = {
  updateMarkdown: (md, caretPos) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.MARKDOWN_UPDATED,
      md: md,
      caretPos: caretPos
    });

    FileActionCreators.parseMarkdown(md);
  },

  parseMarkdown: (md) => {
    MarkdownParser.render(md)
      .then((html) => {
        AppDispatcher.dispatch({
          actionType: ActionTypes.MARKDOWN_PARSED,
          html: html
        });
      });
  },

  appendToMarkdownSource: (markdown) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.APPEND_TO_MARKDOWN_SOURCE,
      markdown: markdown
    });
  }
};

export default FileActionCreators;
