import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes, PanelTypes } from '../constants/AppConstants';
import createPersistentStore from '../utils/createPersistentStore';

const CHANGE_EVENT = 'change';

let state = {
  appState: {
    visiblePanels: [PanelTypes.MARKDOWN_SOURCE, PanelTypes.MARKDOWN_PREVIEW],
    visibleTopPanel: null,
  },
};

const AppStore = Object.assign({}, EventEmitter.prototype, {
  emitChange: () => AppStore.emit(CHANGE_EVENT),
  addChangeListener: (callback) => AppStore.on(CHANGE_EVENT, callback),
  removeChangeListener: (callback) => AppStore.removeListener(CHANGE_EVENT, callback),

  getState: () => state,
  setState: (newState) => (state = newState),
  getAppState: () => state.appState,
});

const makePanelEnterFullscreen = (panelType) => (state.appState.visiblePanels = [panelType]);

const makePanelExitFullscreen = () => {
  const currentVisiblePanel = state.appState.visiblePanels[0];
  let newVisiblePanels;

  switch (currentVisiblePanel) {
    case PanelTypes.MARKDOWN_SOURCE:
    case PanelTypes.MARKDOWN_PREVIEW:
      newVisiblePanels = [PanelTypes.MARKDOWN_SOURCE, PanelTypes.MARKDOWN_PREVIEW];
      break;
    case PanelTypes.HTML_SOURCE:
      newVisiblePanels = [PanelTypes.MARKDOWN_SOURCE, PanelTypes.HTML_SOURCE];
      break;
    default:
      break;
  }

  state.appState.visiblePanels = newVisiblePanels;
};

const switchPanel = (currentPanelType, newPanelType) => {
  const visiblePanelIndex = state.appState.visiblePanels.indexOf(currentPanelType);
  state.appState.visiblePanels[visiblePanelIndex] = newPanelType;
};

const enableTopPanel = (topPanelType) => {
  state.appState.visibleTopPanel = topPanelType;
};

const disableTopPanel = () => {
  state.appState.visibleTopPanel = null;
};

const toggleTopPanel = (topPanelType) => {
  const shouldDisableTopPanel = state.appState.visibleTopPanel === topPanelType;

  if (shouldDisableTopPanel) disableTopPanel();
  else enableTopPanel(topPanelType);
};

const onDispatchedPayload = (payload) => {
  let isPayloadInteresting = true;

  switch (payload.actionType) {
    case ActionTypes.PANEL_ENTER_FULLSCREEN:
      makePanelEnterFullscreen(payload.panelType);
      break;

    case ActionTypes.PANEL_EXIT_FULLSCREEN:
      makePanelExitFullscreen();
      break;

    case ActionTypes.SWITCH_PANEL:
      switchPanel(payload.currentPanelType, payload.newPanelType);
      break;

    case ActionTypes.TOGGLE_TOP_PANEL:
      toggleTopPanel(payload.topPanelType);
      break;

    case ActionTypes.DISABLE_TOP_PANEL:
      disableTopPanel();
      break;

    default:
      isPayloadInteresting = false;
      break;
  }

  if (isPayloadInteresting) AppStore.emitChange();
};

AppDispatcher.register(onDispatchedPayload);

export default createPersistentStore(AppStore, 'app-state');
