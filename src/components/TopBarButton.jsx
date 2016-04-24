import React from 'react';
import { PanelNames, TopBarButtonTypes } from '../constants/AppConstants';
import AppActionCreators from '../action-creators/AppActionCreators';

import styles from '../components/css/TopBarButton.css';

class TopBarButton extends React.Component {
  static propTypes = {
    type: React.PropTypes.string.isRequired,
    panelType: React.PropTypes.string,
    targetPanelType: React.PropTypes.string
  };

  onPanelSwitchClick = () => AppActionCreators.switchPanel(this.props.panelType, this.props.targetPanelType);
  onEnterFullscreenButtonClick = () => AppActionCreators.makePanelEnterFullscreen(this.props.panelType);
  onExitFullscreenButtonClick = () => AppActionCreators.makePanelExitFullscreen();

  render() {
    var { type: buttonType, panelType, targetPanelType } = this.props;
    var buttonClassName;

    switch (buttonType) {
      case TopBarButtonTypes.PANEL_SWITCH:
        return (
          <button className={styles.switch} onClick={this.onPanelSwitchClick}>
            {PanelNames[targetPanelType]}
          </button>
        );

      case TopBarButtonTypes.FULLSCREEN_ON:
        return (
          <button className={styles.fullscreenIconButton} title="Go fullscreen"
            onClick={this.onEnterFullscreenButtonClick}/>
        );

      case TopBarButtonTypes.FULLSCREEN_OFF:
        return (
          <button className={styles.selectedFullscreenIconButton} title="Exit fullscreen"
            onClick={this.onExitFullscreenButtonClick}/>
        );
    }
  }
}

export default TopBarButton;
