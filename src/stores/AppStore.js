'use strict';

import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';

var CHANGE_EVENT = 'change';

var state = {};

var AppStore = Object.assign({}, EventEmitter.prototype, {
  emitChange: () => AppStore.emit(CHANGE_EVENT),
  addChangeListener: (callback) => AppStore.on(CHANGE_EVENT, callback),
  removeChangeListener: (callback) => AppStore.removeListener(CHANGE_EVENT, callback)
});

var onDispatchedPayload = (payload) => {
  var action = payload.action;
  var isPayloadInteresting = true;

  switch(action.actionType) {
    default:
      isPayloadInteresting = false;
      break;
  }

  if (isPayloadInteresting) AppStore.emitChange();
};

AppDispatcher.register(onDispatchedPayload);

export default AppStore;
