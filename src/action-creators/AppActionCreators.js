'use strict';

import AppDispatcher from '../dispatcher/AppDispatcher';
import { ActionTypes } from '../constants/AppConstants';
import MarkdownParser from '../utils/MarkdownParser';

var AppActionCreators = {
  updateMdSource: (md) => {
    AppDispatcher.dispatch({
      actionType: ActionTypes.MARKDOWN_SOURCE_UPDATE,
      md: md
    });

    MarkdownParser.render(md)
      .then((html) => {
        AppDispatcher.dispatch({
          actionType: ActionTypes.HTML_UPDATE,
          html: html
        });
      });
  }
};

export default AppActionCreators;
