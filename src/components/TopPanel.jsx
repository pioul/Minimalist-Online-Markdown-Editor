import React from 'react';
import { TopPanelTypes } from '../constants/AppConstants';
import AppActionCreators from '../action-creators/AppActionCreators';
import ShortcutManager from '../utils/ShortcutManager.js';
import QuickReference from './QuickReference.jsx';
import About from './About.jsx';
import Settings from './Settings.jsx';

import styles from '../components/css/TopPanel.css';

class TopPanel extends React.Component {
  static propTypes = {
    type: React.PropTypes.string.isRequired,
    settingsState: React.PropTypes.object.isRequired,
  };

  componentDidMount() {
    ShortcutManager.register('ESCAPE', this.onEscapeKeyPressed);
  }

  componentWillUnmount() {
    ShortcutManager.unregister('ESCAPE', this.onEscapeKeyPressed);
  }

  onEscapeKeyPressed = () => AppActionCreators.disableTopPanel();
  onTopPanelCloseButtonClick = () => AppActionCreators.disableTopPanel();

  render() {
    const topPanelType = this.props.type;

    return (
      <div className={styles.topPanel}>
        {topPanelType === TopPanelTypes.QUICK_REFERENCE &&
          <QuickReference />}

        {topPanelType === TopPanelTypes.ABOUT &&
          <About />}

        {topPanelType === TopPanelTypes.SETTINGS &&
          <Settings settingsState={this.props.settingsState} />}

        <button className={styles.closeButton} onClick={this.onTopPanelCloseButtonClick} />
      </div>
    );
  }
}

export default TopPanel;
