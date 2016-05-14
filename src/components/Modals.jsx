import React from 'react';
import ModalStore from '../stores/ModalStore';
import { ModalTypes } from '../constants/AppConstants';
import ModalActionCreators from '../action-creators/ModalActionCreators';
import FileActionCreators from '../action-creators/FileActionCreators';
import ShortcutManager from '../utils/ShortcutManager.js';

import styles from '../components/css/Modals.css';

var getState = () => ModalStore.getState();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = getState();
  }

  componentDidMount() {
    ModalStore.addChangeListener(this.onStoreChange);
    ShortcutManager.register('ESCAPE', this.onEscapeKeyPressed, 'modal');
    ShortcutManager.registerScopeResolver(this.shortcutManagerScopeResolver);
  }

  componentDidUpdate = () => this.focusPrimaryButton();

  componentWillUnmount() {
    ModalStore.removeChangeListener(this.onStoreChange);
    ShortcutManager.unregister('ESCAPE', this.onEscapeKeyPressed, 'modal');
    ShortcutManager.unregisterScopeResolver(this.shortcutManagerScopeResolver);
  }

  onStoreChange = () => this.setState(getState());

  onEscapeKeyPressed = () => this.closeModal();

  /**
   * Focus last modal button when the focus is passed to the element preceding
   * the first modal button (i.e. making focus loop through modal buttons)
   */
  onFirstFocusLossDetectorFocus = () => {
    this.refs.buttonsContainer.querySelector('button:last-child').focus();
  };

  /**
   * Focus first modal button when the focus is passed to the element following
   * the last modal button (i.e. making focus loop through modal buttons)
   */
  onLastFocusLossDetectorFocus = () => {
    this.refs.buttonsContainer.querySelector('button:first-child').focus();
  };

  shortcutManagerScopeResolver = () => (this.isModalOpen() ? 'modal' : null);

  focusPrimaryButton = () => {
    if (!this.isModalOpen()) return;
    this.refs.buttonsContainer.querySelector('button:last-child').focus();
  };

  closeModal = () => ModalActionCreators.closeModal();

  isModalOpen = () => this.state.openModal !== null;

  render() {
    var modalConfig;

    if (!this.isModalOpen()) return <div></div>;

    switch (this.state.openModal) {
      case ModalTypes.CONFIRM_CLOSE_NON_EMPTY_FILE:
        modalConfig = {
          text: 'Contents of this tab will be lost if it\'s closed. Close it nonetheless?',
          buttons: [
            { text: 'Don\'t close', className: styles.primaryButton },
            { text: 'Close', className: styles.primaryButton,
              onClick: () => FileActionCreators.closeFile(this.state.options.file, true) },
          ],
        };
        break;

      default:
        break;
    }

    return (
      <div className={styles.modalContainer}>
        <div className={styles.modal}>
          <div className={styles.modalContent}>{modalConfig.text}</div>
          <button
            onFocus={this.onFirstFocusLossDetectorFocus}
            className={styles.focusLossDetectorButton}
          />
          <div className={styles.buttonsContainer} ref="buttonsContainer">
            {modalConfig.buttons.map((button) => (
              <button
                onClick={() => {
                  this.closeModal();
                  if (button.onClick) button.onClick();
                }}
                className={button.className}
              >
                {button.text}
              </button>
            ))}
          </div>
          <button
            onFocus={this.onLastFocusLossDetectorFocus}
            className={styles.focusLossDetectorButton}
          />
        </div>
      </div>
    );
  }
}

export default App;
