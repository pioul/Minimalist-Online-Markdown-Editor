import 'normalize.css';
import './css/global-styles/document-styles.css'; // Order of this import matters
import styles from './css/App.css';

import React from 'react';
import AppStore from '../stores/AppStore';
import FileStore from '../stores/FileStore';
import SettingsStore from '../stores/SettingsStore';
import AppActionCreators from '../action-creators/AppActionCreators';
import FileActionCreators from '../action-creators/FileActionCreators';
import SettingsActionCreators from '../action-creators/SettingsActionCreators';
import ShortcutManager from '../utils/ShortcutManager.js';
import { Themes } from '../constants/AppConstants';
import Panel from '../components/Panel.jsx';
import BottomBar from '../components/BottomBar.jsx';
import Modals from '../components/Modals.jsx';

var getAppStoreState = () => ({ appState: AppStore.getAppState() });
var getFileStoreState = () => ({ fileState: FileStore.getState() });
var getSettingsStoreState = () => ({ settingsState: SettingsStore.getState() });

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = Object.assign({},
      getAppStoreState(),
      getFileStoreState(),
      getSettingsStoreState()
    );
  }

  componentDidMount() {
    AppStore.addChangeListener(this.onAppStoreChange);
    FileStore.addChangeListener(this.onFileStoreChange);
    SettingsStore.addChangeListener(this.onSettingsStoreChange);

    ShortcutManager.register('ESCAPE', this.onEscapeKeyPressed);
    ShortcutManager.register(['CTRL + N', 'CTRL + T'], this.onCreateFileShortcutPressed);
    ShortcutManager.register('CTRL + W', this.onCloseFileShortcutPressed);

    ShortcutManager.register([
      'CTRL + PLUS', 'CTRL + PLUS_FF', 'CTRL + SHIFT + PLUS',
      'CTRL + SHIFT + PLUS_FF', 'CTRL + NUMPADPLUS',
    ], this.onIncreaseFontSizeShortcutPressed);

    ShortcutManager.register([
      'CTRL + MINUS', 'CTRL + MINUS_FF', 'CTRL + SHIFT + MINUS',
      'CTRL + SHIFT + MINUS_FF', 'CTRL + NUMPADMINUS',
    ], this.onDecreaseFontSizeShortcutPressed);
  }

  componentWillUnmount() {
    AppStore.removeChangeListener(this.onAppStoreChange);
    FileStore.removeChangeListener(this.onFileStoreChange);
    SettingsStore.removeChangeListener(this.onSettingsStoreChange);

    ShortcutManager.unregister('ESCAPE', this.onEscapeKeyPressed);
    ShortcutManager.unregister(['CTRL + N', 'CTRL + T'], this.onCreateFileShortcutPressed);
    ShortcutManager.unregister('CTRL + W', this.onCloseFileShortcutPressed);

    ShortcutManager.unregister([
      'CTRL + PLUS', 'CTRL + PLUS_FF', 'CTRL + SHIFT + PLUS',
      'CTRL + SHIFT + PLUS_FF', 'CTRL + NUMPADPLUS',
    ], this.onIncreaseFontSizeShortcutPressed);

    ShortcutManager.unregister([
      'CTRL + MINUS', 'CTRL + MINUS_FF', 'CTRL + SHIFT + MINUS',
      'CTRL + SHIFT + MINUS_FF', 'CTRL + NUMPADMINUS',
    ], this.onDecreaseFontSizeShortcutPressed);
  }

  onAppStoreChange = () => this.setState(getAppStoreState());
  onFileStoreChange = () => this.setState(getFileStoreState());
  onSettingsStoreChange = () => this.setState(getSettingsStoreState());

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

  onIncreaseFontSizeShortcutPressed = (e) => {
    e.preventDefault();
    SettingsActionCreators.increaseFontSize();
  };

  onDecreaseFontSizeShortcutPressed = (e) => {
    e.preventDefault();
    SettingsActionCreators.decreaseFontSize();
  };

  render() {
    const { appState, fileState, settingsState } = this.state;
    const { markdown, html, caretPos } = fileState.activeFile;

    const isDarkThemeEnabled = settingsState.theme === Themes.DARK;

    return (
      <div className={styles.app}>
        {isDarkThemeEnabled &&
          <link href="dark-theme-vars.css" rel="stylesheet" type="text/css" />}

        <div className={styles.panelContainer}>
          {appState.visiblePanels.map((panelType) => (
            <Panel
              key={panelType} type={panelType} markdown={markdown} html={html}
              caretPos={caretPos} appState={appState} files={fileState.files}
              activeFile={fileState.activeFile} settingsState={settingsState}
            />
          ))}
        </div>

        <BottomBar markdown={markdown} />

        <Modals />
      </div>
    );
  }
}

export default App;
