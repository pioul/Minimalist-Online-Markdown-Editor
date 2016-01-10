'use strict';

/**
 * keyMirror mirrors the object's keys as values, e.g. { EXAMPLE_VAL: null } will
 * become { EXAMPLE_VAL: 'EXAMPLE_VAL' }
 */
import keyMirror from 'keymirror';

const ActionTypes = keyMirror({
  MARKDOWN_SOURCE_UPDATE: null
});

export { ActionTypes };
