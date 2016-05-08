/**
 * Register handlers for keyboard shortcuts using a human-readable format.
 *
 * ShortcutManager.register('CTRL + A', handler); // Register one shortcut
 * ShortcutManager.register(['CTRL + A', 'CTRL + B'], handler); // register multiple shortcuts
 * ShortcutManager.unregister('CTRL + A', handler); // Unregister one shortcut
 * ShortcutManager.unregister(['CTRL + A', 'CTRL + B'], handler); // unregister multiple shortcuts
 *
 * For a shortcut's syntax to be valid, it has to be an assortment of key names
 * from the keyCodes map, and if desired, of the modifiers CTRL, SHIFT, ALT.
 * They have to be separated by a + sign and a space. The META key (WIN on Win,
 * CMD on Mac) mirrors CTRL (i.e. a shortcut registered with CTRL will work with
 * META). Example valid shortcuts: 'CTRL + SHIFT + A', 'ESCAPE', 'SHIFT + TAB'
 */
const keyCodes = {
  TAB: 9,
  ESCAPE: 27,
  MINUS: 189,
  MINUS_FF: 173, // Firefox-specific
  PLUS: 187,
  PLUS_FF: 61, // Firefox-specific
  NUMPADMINUS: 109,
  NUMPADPLUS: 107,
  F4: 115,
  PGUP: 33,
  PGDOWN: 34,
  ARROWLEFT: 37,
  ARROWRIGHT: 39,
  N: 78,
  O: 79,
  S: 83,
  T: 84,
  W: 87,
  Y: 89,
  Z: 90,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,
};

const ShortcutManager = (() => {
  const sequenceSeparator = ' + ';
  var handlers = new Map();

  const runMatchingHandler = (e) => {
    var sequence = [];

    if (e.ctrlKey || e.metaKey) sequence.push('CTRL');
    if (e.shiftKey) sequence.push('SHIFT');
    if (e.altKey) sequence.push('ALT');

    sequence.push(e.keyCode);
    const shortcut = sequence.join(sequenceSeparator);

    if (!handlers.has(shortcut)) return;

    const shortcutHandlers = handlers.get(shortcut);
    shortcutHandlers.forEach((handler) => handler(e));
  };

  /**
   * Helper for registering/unregistering multiple shortcuts. Runs callback for
   * each shortcut, after converting human-readable keys to event key codes.
   */
  const forEachShortcut = (shortcuts, callback) => {
    for (let shortcut of shortcuts) {
      // The last fragment of a shortcut should be a character representing
      // a keyboard key: convert it to a keyCode
      const sequence = shortcut.split(sequenceSeparator);
      const sequenceLastIndex = sequence.length - 1;
      const key = sequence[sequenceLastIndex];

      if (keyCodes.hasOwnProperty(key)) sequence[sequenceLastIndex] = keyCodes[key];

      shortcut = sequence.join(sequenceSeparator);

      callback(shortcut);
    }
  };

  document.addEventListener('keydown', runMatchingHandler);

  return {
    register: (shortcuts, handler) => {
      shortcuts = Array.isArray(shortcuts) ? shortcuts : [shortcuts];

      forEachShortcut(shortcuts, (shortcut) => {
        var shortcutHandlers = handlers.has(shortcut) ? handlers.get(shortcut) : [];
        shortcutHandlers.push(handler);
        handlers.set(shortcut, shortcutHandlers);
      });
    },

    unregister: (shortcuts, handler) => {
      shortcuts = Array.isArray(shortcuts) ? shortcuts : [shortcuts];

      forEachShortcut(shortcuts, (shortcut) => {
        var shortcutHandlers = handlers.has(shortcut) ? handlers.get(shortcut) : [];
        const handlerIndex = shortcutHandlers.indexOf(handler);

        if (handlerIndex !== -1) shortcutHandlers.splice(handlerIndex, 1);

        if (shortcutHandlers.length > 0) handlers.set(shortcut, shortcutHandlers);
        else handlers.delete(shortcut);
      });
    },
  };
})();

export default ShortcutManager;
