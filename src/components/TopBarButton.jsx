import React from 'react';
import { PanelNames, TopBarButtonTypes, TopPanelNames } from '../constants/AppConstants';
import AppActionCreators from '../action-creators/AppActionCreators';

import styles from '../components/css/TopBarButton.css';

class TopBarButton extends React.Component {
  static propTypes = {
    type: React.PropTypes.string.isRequired,
    appState: React.PropTypes.object.isRequired,
    panelType: React.PropTypes.string,
    targetPanelType: React.PropTypes.string,
    topPanelType: React.PropTypes.string,
  };

  onPanelSwitchClick = () =>
    AppActionCreators.switchPanel(this.props.panelType, this.props.targetPanelType);

  onEnterFullscreenButtonClick = () =>
    AppActionCreators.makePanelEnterFullscreen(this.props.panelType);

  onExitFullscreenButtonClick = () => AppActionCreators.makePanelExitFullscreen();
  onTopPanelToggleButtonClick = () => AppActionCreators.toggleTopPanel(this.props.topPanelType);

  render() {
    var { type: buttonType, appState, targetPanelType, topPanelType } = this.props;
    var buttonClassName;
    var topBarButtonContent;

    switch (buttonType) {
      case TopBarButtonTypes.PANEL_SWITCH:
        buttonClassName =
          appState.visiblePanels.includes(targetPanelType) ? styles.activeSwitch : styles.switch;

        topBarButtonContent = (
          <button className={buttonClassName} onClick={this.onPanelSwitchClick}>
            {PanelNames[targetPanelType]}
          </button>
        );
        break;

      case TopBarButtonTypes.FULLSCREEN_ON:
        topBarButtonContent = (
          <button
            className={styles.fullscreenIconButton} title="Go fullscreen"
            onClick={this.onEnterFullscreenButtonClick}
          />
        );
        break;

      case TopBarButtonTypes.FULLSCREEN_OFF:
        topBarButtonContent = (
          <button
            className={styles.selectedFullscreenIconButton} title="Exit fullscreen"
            onClick={this.onExitFullscreenButtonClick}
          />
        );
        break;

      case TopBarButtonTypes.TOP_PANEL_TOGGLE:
        buttonClassName =
          appState.visibleTopPanel === topPanelType ? styles.selectedButton : styles.button;

        topBarButtonContent = (
          <button className={buttonClassName} onClick={this.onTopPanelToggleButtonClick}>
            {TopPanelNames[topPanelType]}
          </button>
        );
        break;

      default:
        break;
    }

    return topBarButtonContent;
  }
}

export default TopBarButton;
