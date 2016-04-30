/**
 * keyMirror mirrors the object's keys as values, e.g. { EXAMPLE_VAL: null } will
 * become { EXAMPLE_VAL: 'EXAMPLE_VAL' }
 */
import keyMirror from 'keymirror';

const ActionTypes = keyMirror({
  MARKDOWN_UPDATED: null,
  MARKDOWN_PARSED: null,
  PANEL_ENTER_FULLSCREEN: null,
  PANEL_EXIT_FULLSCREEN: null,
  SWITCH_PANEL: null,
  TOGGLE_TOP_PANEL: null,
  DISABLE_TOP_PANEL: null,
  APPEND_TO_MARKDOWN_SOURCE: null
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
  FULLSCREEN_OFF: null,
  TOP_PANEL_TOGGLE: null
});

const TopPanelTypes = keyMirror({
  QUICK_REFERENCE: null,
  ABOUT: null
});

const TopPanelNames = {
  QUICK_REFERENCE: 'Quick Reference',
  ABOUT: 'About'
};

export { ActionTypes, PanelTypes, PanelNames, TopBarButtonTypes, TopPanelTypes, TopPanelNames };
