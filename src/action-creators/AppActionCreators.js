import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes } from '../constants/AppConstants';
import MarkdownParser from '../utils/MarkdownParser';

var AppActionCreators = {
  updateMdSource: (md) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.MARKDOWN_SOURCE_UPDATE,
      md: md
    });

    MarkdownParser.render(md)
      .then((html) => {
        AppDispatcher.dispatch({
          actionType: ActionTypes.HTML_UPDATE,
          html: html
        });
      });
  },

  toggleFullscreen: (panelType) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.TOGGLE_FULLSCREEN,
      panelType: panelType
    });
  },

  switchPanel: (currentPanelType, newPanelType) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.SWITCH_PANEL,
      currentPanelType: currentPanelType,
      newPanelType: newPanelType
    });
  }
};

export default AppActionCreators;
