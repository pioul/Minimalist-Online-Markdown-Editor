/**
 * keyMirror mirrors the object's keys as values, e.g. { EXAMPLE_VAL: null } will
 * become { EXAMPLE_VAL: 'EXAMPLE_VAL' }
 */
import keyMirror from 'keymirror';

const ActionTypes = keyMirror({
  MARKDOWN_SOURCE_UPDATE: null,
  HTML_UPDATE: null,
  PANEL_ENTER_FULLSCREEN: null,
  PANEL_EXIT_FULLSCREEN: null,
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

const TopBarButtonTypes = keyMirror({
  PANEL_SWITCH: null,
  FULLSCREEN_ON: null,
  FULLSCREEN_OFF: null
});

export { ActionTypes, PanelTypes, PanelNames, TopBarButtonTypes };
