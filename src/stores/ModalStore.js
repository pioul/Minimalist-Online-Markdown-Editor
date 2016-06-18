import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes } from '../constants/AppConstants';

const CHANGE_EVENT = 'change';

const state = {
  openModal: null,
  options: {},
};

const ModalStore = Object.assign({}, EventEmitter.prototype, {
  emitChange: () => ModalStore.emit(CHANGE_EVENT),
  addChangeListener: (callback) => ModalStore.on(CHANGE_EVENT, callback),
  removeChangeListener: (callback) => ModalStore.removeListener(CHANGE_EVENT, callback),

  getState: () => state,
});

const openModal = (modalType, options) => {
  state.openModal = modalType;
  state.options = options;
};

const closeModal = () => {
  state.openModal = null;
  state.options = {};
};

const onDispatchedPayload = (payload) => {
  let isPayloadInteresting = true;

  switch (payload.actionType) {
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
