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
    var topPanelContents;

    switch (this.props.type) {
      case TopPanelTypes.QUICK_REFERENCE:
        topPanelContents = <QuickReference />;
        break;

      case TopPanelTypes.ABOUT:
        topPanelContents = <About />;
        break;

      case TopPanelTypes.SETTINGS:
        topPanelContents = <Settings />;
        break;

      default:
        break;
    }

    return (
      <div className={styles.topPanel}>
        {topPanelContents}
        <button className={styles.closeButton} onClick={this.onTopPanelCloseButtonClick} />
      </div>
    );
  }
}

export default TopPanel;
