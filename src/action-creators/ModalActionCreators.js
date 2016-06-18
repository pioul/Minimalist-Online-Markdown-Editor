import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes } from '../constants/AppConstants';

const ModalActionCreators = {
  openModal: (modalType, options) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.OPEN_MODAL,
      modalType,
      options,
    });
  },

  closeModal: () => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.CLOSE_MODAL,
    });
  },
};

export default ModalActionCreators;
