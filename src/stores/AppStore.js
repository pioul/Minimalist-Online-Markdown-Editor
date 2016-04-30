import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes, PanelTypes } from '../constants/AppConstants';
import AppActionCreators from '../action-creators/AppActionCreators';

var CHANGE_EVENT = 'change';

var state = {
  markdown: '',
  html: '',
  caretPos: [0, 0],

  appState: {
    visiblePanels: [PanelTypes.MARKDOWN_SOURCE, PanelTypes.MARKDOWN_PREVIEW],
    visibleTopPanel: null
  }
};

var AppStore = Object.assign({}, EventEmitter.prototype, {
  emitChange: () => AppStore.emit(CHANGE_EVENT),
  addChangeListener: (callback) => AppStore.on(CHANGE_EVENT, callback),
  removeChangeListener: (callback) => AppStore.removeListener(CHANGE_EVENT, callback),

  getState: () => state
});

var updateMarkdown = (md, caretPos) => {
  state.markdown = md;
  state.caretPos = caretPos;
};

var updateHtml = (html) => state.html = html;

var appendToMarkdownSource = (markdown) => {
  state.markdown += markdown;
  state.caretPos = [state.markdown.length, state.markdown.length];

  AppActionCreators.parseMarkdown(state.markdown);
};

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

var toggleTopPanel = (topPanelType) => {
  var shouldDisableTopPanel = state.appState.visibleTopPanel === topPanelType;

  if (shouldDisableTopPanel) disableTopPanel();
    else enableTopPanel(topPanelType);
};

var enableTopPanel = (topPanelType) => {
  state.appState.visibleTopPanel = topPanelType;
};

var disableTopPanel = () => {
  state.appState.visibleTopPanel = null;
};

var onDispatchedPayload = (payload) => {
  var isPayloadInteresting = true;

  switch(payload.actionType) {
    case ActionTypes.MARKDOWN_UPDATED:
      updateMarkdown(payload.md, payload.caretPos);
      break;

    case ActionTypes.MARKDOWN_PARSED:
      updateHtml(payload.html);
      break;

    case ActionTypes.APPEND_TO_MARKDOWN_SOURCE:
      appendToMarkdownSource(payload.markdown);
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

export default AppStore;
