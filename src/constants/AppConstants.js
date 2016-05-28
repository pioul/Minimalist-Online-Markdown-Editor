/**
 * keyMirror mirrors the object's keys as values, e.g. { EXAMPLE_VAL: null } will
 * become { EXAMPLE_VAL: 'EXAMPLE_VAL' }
 */
import keyMirror from 'keymirror';

const ActionTypes = keyMirror({
  EDITOR_STATE_UPDATED: null,
  EDITOR_MOVE_FOCUS_TO_END: null,
  APPEND_TO_MARKDOWN_SOURCE: null,
  PANEL_ENTER_FULLSCREEN: null,
  PANEL_EXIT_FULLSCREEN: null,
  SWITCH_PANEL: null,
  TOGGLE_TOP_PANEL: null,
  DISABLE_TOP_PANEL: null,
  UPDATE_ACTIVE_FILE: null,
  CLOSE_FILE: null,
  OPEN_MODAL: null,
  CLOSE_MODAL: null,
  INCREASE_FONT_SIZE: null,
  DECREASE_FONT_SIZE: null,
  SWITCH_THEME: null,
});

const PanelTypes = keyMirror({
  MARKDOWN_SOURCE: null,
  MARKDOWN_PREVIEW: null,
  HTML_SOURCE: null,
});

const PanelNames = {
  MARKDOWN_SOURCE: 'Markdown',
  MARKDOWN_PREVIEW: 'Preview',
  HTML_SOURCE: 'HTML',
};

const TopBarButtonTypes = keyMirror({
  PANEL_SWITCH: null,
  FULLSCREEN_ON: null,
  FULLSCREEN_OFF: null,
  TOP_PANEL_TOGGLE: null,
});

const TopPanelTypes = keyMirror({
  QUICK_REFERENCE: null,
  ABOUT: null,
  SETTINGS: null,
});

const TopPanelNames = {
  QUICK_REFERENCE: 'Quick Reference',
  ABOUT: 'About',
};

const ModalTypes = keyMirror({
  CONFIRM_CLOSE_NON_EMPTY_FILE: null,
});

const Themes = keyMirror({
  LIGHT: null,
  DARK: null,
});

const ThemeNames = {
  LIGHT: 'Light',
  DARK: 'Dark',
};

const FontSizeOffsetRange = [-3.6, 14.4];

export {
  ActionTypes, PanelTypes, PanelNames, TopBarButtonTypes, TopPanelTypes,
  TopPanelNames, ModalTypes, Themes, ThemeNames, FontSizeOffsetRange,
};
