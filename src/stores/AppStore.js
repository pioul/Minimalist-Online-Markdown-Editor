import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes, PanelTypes } from '../constants/AppConstants';

var CHANGE_EVENT = 'change';

var state = {
  markdown: '',
  html: '',

  appState: {
    visiblePanels: [PanelTypes.MARKDOWN_SOURCE, PanelTypes.MARKDOWN_PREVIEW]
  }
};

var AppStore = Object.assign({}, EventEmitter.prototype, {
  emitChange: () => AppStore.emit(CHANGE_EVENT),
  addChangeListener: (callback) => AppStore.on(CHANGE_EVENT, callback),
  removeChangeListener: (callback) => AppStore.removeListener(CHANGE_EVENT, callback),

  getMarkdown: () => state.markdown,
  getHtml: () => state.html,
  getAppState: () => state.appState
});

var updateMdSource = (md) => state.markdown = md;
var updateHtml = (html) => state.html = html;

var makePanelEnterFullscreen = (panelType) => state.appState.visiblePanels = [panelType];

var makePanelExitFullscreen = () => {
  var currentVisiblePanel = state.appState.visiblePanels[0];
  var newVisiblePanels;

  switch (currentVisiblePanel) {
    case PanelTypes.MARKDOWN_SOURCE:
    case PanelTypes.MARKDOWN_PREVIEW:
      newVisiblePanels = [PanelTypes.MARKDOWN_SOURCE, PanelTypes.MARKDOWN_PREVIEW];
      break;
    case PanelTypes.HTML_SOURCE:
      newVisiblePanels = [PanelTypes.MARKDOWN_SOURCE, PanelTypes.HTML_SOURCE];
      break;
  }

  state.appState.visiblePanels = newVisiblePanels;
};

var switchPanel = (currentPanelType, newPanelType) => {
  var visiblePanelIndex = state.appState.visiblePanels.indexOf(currentPanelType);
  state.appState.visiblePanels[visiblePanelIndex] = newPanelType;
};

var onDispatchedPayload = (payload) => {
  var isPayloadInteresting = true;

  switch(payload.actionType) {
    case ActionTypes.MARKDOWN_SOURCE_UPDATE:
      updateMdSource(payload.md);
      break;

    case ActionTypes.HTML_UPDATE:
      updateHtml(payload.html);
      break;

    case ActionTypes.PANEL_ENTER_FULLSCREEN:
      makePanelEnterFullscreen(payload.panelType);
      break;

    case ActionTypes.PANEL_EXIT_FULLSCREEN:
      makePanelExitFullscreen();
      break;

    case ActionTypes.SWITCH_PANEL:
      switchPanel(payload.currentPanelType, payload.newPanelType);
      break;

    default:
      isPayloadInteresting = false;
      break;
  }

  if (isPayloadInteresting) AppStore.emitChange();
};

AppDispatcher.register(onDispatchedPayload);

export default AppStore;
