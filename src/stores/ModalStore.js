import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes } from '../constants/AppConstants';

var CHANGE_EVENT = 'change';

var state = {
  openModal: null,
  options: {}
};

var ModalStore = Object.assign({}, EventEmitter.prototype, {
  emitChange: () => ModalStore.emit(CHANGE_EVENT),
  addChangeListener: (callback) => ModalStore.on(CHANGE_EVENT, callback),
  removeChangeListener: (callback) => ModalStore.removeListener(CHANGE_EVENT, callback),

  getState: () => state
});

var openModal = (modalType, options) => {
  state.openModal = modalType;
  state.options = options;
};

var closeModal = () => {
  state.openModal = null;
  state.options = {};
};

var onDispatchedPayload = (payload) => {
  var isPayloadInteresting = true;

  switch(payload.actionType) {
    case ActionTypes.OPEN_MODAL:
      openModal(payload.modalType, payload.options);
      break;

    case ActionTypes.CLOSE_MODAL:
      closeModal();
      break;

    default:
      isPayloadInteresting = false;
      break;
  }

  if (isPayloadInteresting) ModalStore.emitChange();
};

AppDispatcher.register(onDispatchedPayload);

export default ModalStore;
