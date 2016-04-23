'use strict';

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

var onDispatchedPayload = (payload) => {
  var isPayloadInteresting = true;

  switch(payload.actionType) {
    case ActionTypes.MARKDOWN_SOURCE_UPDATE:
      updateMdSource(payload.md);
      break;

    case ActionTypes.HTML_UPDATE:
      updateHtml(payload.html);
      break;

    default:
      isPayloadInteresting = false;
      break;
  }

  if (isPayloadInteresting) AppStore.emitChange();
};

AppDispatcher.register(onDispatchedPayload);

export default AppStore;
