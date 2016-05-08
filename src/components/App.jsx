import './css/global-styles/document-styles.css'; // Order of this import matters
import styles from './css/App.css';

import React from 'react';
import AppStore from '../stores/AppStore';
import FileStore from '../stores/FileStore';
import AppActionCreators from '../action-creators/AppActionCreators';
import FileActionCreators from '../action-creators/FileActionCreators';
import ShortcutManager from '../utils/ShortcutManager.js';
import Panel from '../components/Panel.jsx';
import Modals from '../components/Modals.jsx';

var getAppStoreState = () => ({ appState: AppStore.getAppState() });
var getFileStoreState = () => ({ fileState: FileStore.getState() });

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = Object.assign({},
      getAppStoreState(),
      getFileStoreState()
    );
  }

  componentDidMount() {
    AppStore.addChangeListener(this.onAppStoreChange);
    FileStore.addChangeListener(this.onFileStoreChange);

    ShortcutManager.register('ESCAPE', this.onEscapeKeyPressed);
    ShortcutManager.register(['CTRL + N', 'CTRL + T'], this.onCreateFileShortcutPressed);
    ShortcutManager.register('CTRL + W', this.onCloseFileShortcutPressed);
  }

  componentWillUnmount() {
    AppStore.removeChangeListener(this.onAppStoreChange);
    FileStore.removeChangeListener(this.onFileStoreChange);

    ShortcutManager.unregister('ESCAPE', this.onEscapeKeyPressed);
    ShortcutManager.unregister(['CTRL + N', 'CTRL + T'], this.onCreateFileShortcutPressed);
    ShortcutManager.unregister('CTRL + W', this.onCloseFileShortcutPressed);
  }

  onAppStoreChange = () => this.setState(getAppStoreState());
  onFileStoreChange = () => this.setState(getFileStoreState());

  onEscapeKeyPressed = () => {
    var isFullscreen = this.state.appState.visiblePanels.length === 1;
    if (isFullscreen) AppActionCreators.makePanelExitFullscreen();
  };

  onCreateFileShortcutPressed = (e) => {
    e.preventDefault();
    FileActionCreators.createAndSelectNewFile();
  };

  onCloseFileShortcutPressed = (e) => {
    e.preventDefault();
    FileActionCreators.closeFile(this.state.fileState.activeFile);
  };

  render() {
    var { appState, fileState } = this.state;
    var { markdown, html, caretPos } = fileState.activeFile;

    return (
      <div className={styles.app}>
        <div className={styles.panelContainer}>
          {appState.visiblePanels.map((panelType) => (
            <Panel
              type={panelType} markdown={markdown} html={html}
              caretPos={caretPos} appState={appState} files={fileState.files}
              activeFile={fileState.activeFile}
            />
          ))}
        </div>

        <Modals />
      </div>
    );
  }
}

export default App;
