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
 *
 * ShortcutManager also offers the notion of scopes, so that in some situations,
 * only specific handlers are run. To make use of scopes, two pieces come into
 * play: registering a handler on a shortcut with a specific scope, and then
 * registering a scope resolver, which is nothing else than a function that's
 * executed before processing any shortcuts to only run handlers that match
 * the scope it returns:
 *
 * // Register one shortcut for the 'modal' scope
 * ShortcutManager.register('ESCAPE', handler, 'modal');
 *
 * // Right now that handler will never be run, since the default scope is null.
 * // Register a scope resolver to indicate in what context that 'modal'-scoped
 * // handler should be run.
 * const modalScopeResolver = () => (isModalOpen ? 'modal' : null);
 * ShortcutManager.registerScopeResolver(modalScopeResolver);
 *
 * With that scope resolver registered, the 'modal'-scoped shortcut will only
 * be taken into account when a modal is open; and when such a modal is open,
 * all other handlers (using a different scope or the default null scope) will
 * be ignored.
 *
 * Scope resolvers can also be unregistered when not needed anymore:
 *
 * ShortcutManager.unregisterScopeResolver(modalScopeResolver);
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
  const SEQUENCE_SEPARATOR = ' + ';
  const handlers = new Map();
  const scopeResolvers = [];

  const runMatchingHandler = (e) => {
    const sequence = [];

    if (e.ctrlKey || e.metaKey) sequence.push('CTRL');
    if (e.shiftKey) sequence.push('SHIFT');
    if (e.altKey) sequence.push('ALT');

    sequence.push(e.keyCode);
    const shortcut = sequence.join(SEQUENCE_SEPARATOR);

    if (!handlers.has(shortcut)) return;

    const scope = scopeResolvers.reduce((reducedScope, scopeResolver) => {
      const resolvedScope = scopeResolver();
      return resolvedScope !== null ? resolvedScope : reducedScope;
    }, null);

    const shortcutHandlers = handlers.get(shortcut);
    shortcutHandlers.forEach(({ handler, scope: handlerScope }) => {
      if (handlerScope === scope) handler(e);
    });
  };

  /**
   * Helper for registering/unregistering multiple shortcuts. Runs callback for
   * each shortcut, after converting human-readable keys to event key codes.
   */
  const forEachShortcut = (shortcuts, callback) => {
    for (let shortcut of shortcuts) {
      // The last fragment of a shortcut should be a character representing
      // a keyboard key: convert it to a keyCode
      const sequence = shortcut.split(SEQUENCE_SEPARATOR);
      const sequenceLastIndex = sequence.length - 1;
      const key = sequence[sequenceLastIndex];

      if (keyCodes.hasOwnProperty(key)) sequence[sequenceLastIndex] = keyCodes[key];

      shortcut = sequence.join(SEQUENCE_SEPARATOR);

      callback(shortcut);
    }
  };

  document.addEventListener('keydown', runMatchingHandler);

  return {
    register: (shortcuts, handler, scope = null) => {
      shortcuts = Array.isArray(shortcuts) ? shortcuts : [shortcuts];

      forEachShortcut(shortcuts, (shortcut) => {
        const shortcutHandlers = handlers.has(shortcut) ? handlers.get(shortcut) : [];
        shortcutHandlers.push({ handler, scope });
        handlers.set(shortcut, shortcutHandlers);
      });
    },

    unregister: (shortcuts, handler, scope = null) => {
      shortcuts = Array.isArray(shortcuts) ? shortcuts : [shortcuts];

      forEachShortcut(shortcuts, (shortcut) => {
        const shortcutHandlers = handlers.has(shortcut) ? handlers.get(shortcut) : [];
        const handlerIndex = shortcutHandlers.findIndex((shortcutHandler) =>
          shortcutHandler.handler === handler && shortcutHandler.scope === scope);

        if (handlerIndex !== -1) shortcutHandlers.splice(handlerIndex, 1);

        if (shortcutHandlers.length > 0) handlers.set(shortcut, shortcutHandlers);
        else handlers.delete(shortcut);
      });
    },

    registerScopeResolver: (scopeResolver) => scopeResolvers.push(scopeResolver),

    unregisterScopeResolver: (scopeResolver) => {
      const scopeResolverIndex = scopeResolvers.indexOf(scopeResolver);
      if (scopeResolverIndex !== -1) scopeResolvers.splice(scopeResolverIndex, 1);
    },
  };
})();

export default ShortcutManager;
