import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes } from '../constants/AppConstants';

const SettingsActionCreators = {
  increaseFontSize: () => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.INCREASE_FONT_SIZE,
    });
  },

  decreaseFontSize: () => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.DECREASE_FONT_SIZE,
    });
  },

  switchTheme: (theme) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.SWITCH_THEME,
      theme,
    });
  },
};

export default SettingsActionCreators;
