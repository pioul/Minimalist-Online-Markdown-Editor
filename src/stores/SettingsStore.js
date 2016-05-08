import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes, Themes, FontSizeOffsetRange } from '../constants/AppConstants';
import createPersistentStore from '../utils/createPersistentStore';

const CHANGE_EVENT = 'change';

let state = {
  theme: Themes.LIGHT,
  fontSizeOffset: 0,
};

const SettingsStore = Object.assign({}, EventEmitter.prototype, {
  emitChange: () => SettingsStore.emit(CHANGE_EVENT),
  addChangeListener: (callback) => SettingsStore.on(CHANGE_EVENT, callback),
  removeChangeListener: (callback) => SettingsStore.removeListener(CHANGE_EVENT, callback),

  getState: () => state,
  setState: (newState) => state = newState,
});

const increaseFontSize = () => {
  const maxFontSizeOffset = FontSizeOffsetRange[1];
  const newFontSizeOffsetFloat = state.fontSizeOffset + 1.2;
  const newFontSizeOffset = Math.round((newFontSizeOffsetFloat) * 10) / 10;

  if (newFontSizeOffset > maxFontSizeOffset) return;
  state.fontSizeOffset = newFontSizeOffset;
};

const decreaseFontSize = () => {
  const minFontSizeOffset = FontSizeOffsetRange[0];
  const newFontSizeOffsetFloat = state.fontSizeOffset - 1.2;
  const newFontSizeOffset = Math.round((newFontSizeOffsetFloat) * 10) / 10;

  if (newFontSizeOffset < minFontSizeOffset) return;
  state.fontSizeOffset = newFontSizeOffset;
};

const switchTheme = (theme) => state.theme = theme;

const onDispatchedPayload = (payload) => {
  let isPayloadInteresting = true;

  switch (payload.actionType) {
    case ActionTypes.INCREASE_FONT_SIZE:
      increaseFontSize();
      break;

    case ActionTypes.DECREASE_FONT_SIZE:
      decreaseFontSize();
      break;

    case ActionTypes.SWITCH_THEME:
      switchTheme(payload.theme);
      break;

    default:
      isPayloadInteresting = false;
      break;
  }

  if (isPayloadInteresting) SettingsStore.emitChange();
};

AppDispatcher.register(onDispatchedPayload);

export default createPersistentStore(SettingsStore, 'settings-state');
