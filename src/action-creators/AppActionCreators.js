import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes } from '../constants/AppConstants';

const AppActionCreators = {
  makePanelEnterFullscreen: (panelType) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.PANEL_ENTER_FULLSCREEN,
      panelType,
    });

    AppActionCreators.disableTopPanel();
  },

  makePanelExitFullscreen: () => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.PANEL_EXIT_FULLSCREEN,
    });
  },

  switchPanel: (currentPanelType, newPanelType) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.SWITCH_PANEL,
      currentPanelType,
      newPanelType,
    });
  },

  toggleTopPanel: (topPanelType) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.TOGGLE_TOP_PANEL,
      topPanelType,
    });
  },

  disableTopPanel: () => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.DISABLE_TOP_PANEL,
    });
  },
};

export default AppActionCreators;
