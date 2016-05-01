import React from 'react';
import ModalStore from '../stores/ModalStore';
import { ModalTypes } from '../constants/AppConstants';
import ModalActionCreators from '../action-creators/ModalActionCreators';
import FileActionCreators from '../action-creators/FileActionCreators';

import styles from '../components/css/Modals.css';

var getState = () => ModalStore.getState();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = getState();
  }

  componentDidMount = () => ModalStore.addChangeListener(this.onStoreChange);
  componentWillUnmount = () => ModalStore.removeChangeListener(this.onStoreChange);
  onStoreChange = () => this.setState(getState());

  closeModal = () => ModalActionCreators.closeModal();

  render() {
    var isModalOpen = this.state.openModal !== null;
    var modalConfig;

    if (!isModalOpen) return <div></div>;

    switch (this.state.openModal) {
      case ModalTypes.CONFIRM_CLOSE_NON_EMPTY_FILE:
        modalConfig = {
          text: 'Contents of this tab will be lost if it\'s closed. Close it nonetheless?',
          buttons: [
            { text: 'Don\'t close', className: styles.primaryButton },
            { text: 'Close', className: styles.primaryButton,
              onClick: () => FileActionCreators.closeFile(this.state.options.file, true) }
          ]
        };
        break;
    }

    return (
      <div className={styles.modalContainer}>
        <div className={styles.modal}>
          <div className={styles.modalContent}>{modalConfig.text}</div>
          <div className={styles.buttonsContainer}>
            { modalConfig.buttons.map((button) =>
                <button onClick={() => {
                  this.closeModal(), button.onClick && button.onClick()
                }} className={button.className}>{button.text}</button>) }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
