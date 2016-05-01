import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes } from '../constants/AppConstants';

var ModalActionCreators = {
  openModal: (modalType, options) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.OPEN_MODAL,
      modalType: modalType,
      options: options
    });
  },

  closeModal: () => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.CLOSE_MODAL
    });
  }
};

export default ModalActionCreators;
