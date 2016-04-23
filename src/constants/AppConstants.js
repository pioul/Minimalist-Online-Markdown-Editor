/**
 * keyMirror mirrors the object's keys as values, e.g. { EXAMPLE_VAL: null } will
 * become { EXAMPLE_VAL: 'EXAMPLE_VAL' }
 */
import keyMirror from 'keymirror';

const ActionTypes = keyMirror({
  MARKDOWN_SOURCE_UPDATE: null,
  HTML_UPDATE: null,
  TOGGLE_FULLSCREEN: null,
  SWITCH_PANEL: null
});

const PanelTypes = keyMirror({
  MARKDOWN_SOURCE: null,
  MARKDOWN_PREVIEW: null,
  HTML_SOURCE: null
});

const PanelNames = {
  MARKDOWN_SOURCE: 'Markdown',
  MARKDOWN_PREVIEW: 'Preview',
  HTML_SOURCE: 'HTML'
};

export { ActionTypes, PanelTypes, PanelNames };
