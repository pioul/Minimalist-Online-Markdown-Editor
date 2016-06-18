/**
 * createPersistentStore returns a store after adding persistence superpowers to it.
 *
 * Both the store to make persistent and a storage key have to be passed.
 *
 * The store returned will automatically persist its data on every change. This
 * data is gathered from store.getPersistedState (use that method if that store
 * needs to have precise control over what data is persisted), otherwise if that
 * method isn't set, it uses the generic store.getState (to save everything).
 *
 * Upon being initialized again, the store will look for any persisted data to
 * automatically populate itself. The same level of flexibility exists for
 * retrieving persisted data, with store.setPersistedState and store.setState.
 */

import throttle from 'lodash.throttle';

const persistData = (store, storageKey) => {
  const state = store.getPersistedState ? store.getPersistedState() : store.getState();
  localStorage.setItem(storageKey, JSON.stringify(state));
};

const retrievePersistedData = (store, storageKey) => {
  const persistedState = JSON.parse(localStorage.getItem(storageKey));

  if (persistedState) {
    if (store.setPersistedState) store.setPersistedState(persistedState);
    else store.setState(persistedState);
  }
};

const createPersistentStore = (store, storageKey) => {
  if (typeof store.getPersistedState !== 'function' && typeof store.getState !== 'function') {
    throw new Error(`Tried to persist store that doesn't have a getState() method.
    getState() is necessary to retrieve the data to persist.`);
  }

  if (typeof store.setPersistedState !== 'function' && typeof store.setState !== 'function') {
    throw new Error(`Tried to persist store that doesn't have a setState() method.
    setState() is necessary to restore the data that was persisted upon reload.`);
  }

  retrievePersistedData(store, storageKey);

  store.addChangeListener(
    throttle(() => persistData(store, storageKey), 1000, { leading: false })
  );

  return store;
};

export default createPersistentStore;
