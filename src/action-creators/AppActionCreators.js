import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes } from '../constants/AppConstants';
import MarkdownParser from '../utils/MarkdownParser';

var AppActionCreators = {
  updateMarkdown: (md, caretPos) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.MARKDOWN_UPDATED,
      md: md,
      caretPos: caretPos
    });

    AppActionCreators.parseMarkdown(md);
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

  makePanelEnterFullscreen: (panelType) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.PANEL_ENTER_FULLSCREEN,
      panelType: panelType
    });
  },

  makePanelExitFullscreen: () => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.PANEL_EXIT_FULLSCREEN
    });
  },

  switchPanel: (currentPanelType, newPanelType) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.SWITCH_PANEL,
      currentPanelType: currentPanelType,
      newPanelType: newPanelType
    });
  },

  toggleTopPanel: (topPanelType) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.TOGGLE_TOP_PANEL,
      topPanelType: topPanelType
    });
  },

  disableTopPanel: () => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.DISABLE_TOP_PANEL
    });
  },

  appendToMarkdownSource: (markdown) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.APPEND_TO_MARKDOWN_SOURCE,
      markdown: markdown
    });
  }
};

export default AppActionCreators;
