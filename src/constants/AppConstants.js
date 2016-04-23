'use strict';

/**
 * keyMirror mirrors the object's keys as values, e.g. { EXAMPLE_VAL: null } will
 * become { EXAMPLE_VAL: 'EXAMPLE_VAL' }
 */
import keyMirror from 'keymirror';

const ActionTypes = keyMirror({
  MARKDOWN_SOURCE_UPDATE: null,
  HTML_UPDATE: null
});

const PanelTypes = keyMirror({
  MARKDOWN_SOURCE: null,
  MARKDOWN_PREVIEW: null,
  HTML_SOURCE: null
});

export { ActionTypes, PanelTypes };
