'use strict';

import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes } from '../constants/AppConstants';

var AppActionCreators = {
  updateMdSource: (md) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.MARKDOWN_SOURCE_UPDATE,
      md: md
    });
  }
};

export default AppActionCreators;
