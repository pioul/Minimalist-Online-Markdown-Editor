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
  }
};

export default AppActionCreators;
