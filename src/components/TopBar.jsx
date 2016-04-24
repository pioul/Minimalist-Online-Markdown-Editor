import React from 'react';
import { PanelTypes, TopBarButtonTypes } from '../constants/AppConstants';
import TopBarButton from '../components/TopBarButton.jsx';

import styles from '../components/css/TopBar.css';

class TopBar extends React.Component {
  static propTypes = {
    type: React.PropTypes.string.isRequired,
    appState: React.PropTypes.object.isRequired,
    className: React.PropTypes.string
  };

  getFullscreenTopBarContents = () => {
    var topBarClassName = [
      styles.topbar,
      this.props.className
    ].join(' ');

    return (
      <div className={topBarClassName}>
        <div className={styles.buttonsContainer}>
          <TopBarButton type={TopBarButtonTypes.PANEL_SWITCH}
            panelType={this.props.type} targetPanelType={PanelTypes.MARKDOWN_SOURCE}/>
          <TopBarButton type={TopBarButtonTypes.PANEL_SWITCH}
            panelType={this.props.type} targetPanelType={PanelTypes.HTML_SOURCE}/>
          <TopBarButton type={TopBarButtonTypes.PANEL_SWITCH}
            panelType={this.props.type} targetPanelType={PanelTypes.MARKDOWN_PREVIEW}/>
          <TopBarButton type={TopBarButtonTypes.FULLSCREEN_OFF}/>
        </div>
      </div>
    );
  };

  getPaneledTopbarContents = (topBarPlacement) => {
    var topBarClassName = [
      styles.topbar,
      this.props.className
    ].join(' ');

    switch (topBarPlacement) {
      case PanelTypes.MARKDOWN_SOURCE:
        return (
          <div className={topBarClassName}>
            <div className={styles.buttonsContainer}>
              <TopBarButton type={TopBarButtonTypes.FULLSCREEN_ON}
                panelType={this.props.type}/>
            </div>
          </div>
        );

      case PanelTypes.MARKDOWN_PREVIEW:
        return (
          <div className={topBarClassName}>
            <div className={styles.buttonsContainer}>
              <TopBarButton type={TopBarButtonTypes.PANEL_SWITCH}
                panelType={this.props.type} targetPanelType={PanelTypes.HTML_SOURCE}/>
              <TopBarButton type={TopBarButtonTypes.PANEL_SWITCH}
                panelType={this.props.type} targetPanelType={PanelTypes.MARKDOWN_PREVIEW}/>
              <TopBarButton type={TopBarButtonTypes.FULLSCREEN_ON}
                panelType={this.props.type}/>
            </div>
          </div>
        );

      case PanelTypes.HTML_SOURCE:
        return (
          <div className={topBarClassName}>
            <div className={styles.buttonsContainer}>
            <TopBarButton type={TopBarButtonTypes.PANEL_SWITCH}
              panelType={this.props.type} targetPanelType={PanelTypes.HTML_SOURCE}/>
            <TopBarButton type={TopBarButtonTypes.PANEL_SWITCH}
              panelType={this.props.type} targetPanelType={PanelTypes.MARKDOWN_PREVIEW}/>
            <TopBarButton type={TopBarButtonTypes.FULLSCREEN_ON}
              panelType={this.props.type}/>
            </div>
          </div>
        );
    }
  };

  render() {
    var isFullscreen = this.props.appState.visiblePanels.length === 1;

    return isFullscreen ?
      this.getFullscreenTopBarContents() :
      this.getPaneledTopbarContents(this.props.type);
  }
}

export default TopBar;
