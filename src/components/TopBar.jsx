import React from 'react';
import { PanelTypes, TopBarButtonTypes, TopPanelTypes } from '../constants/AppConstants';
import TopBarButton from '../components/TopBarButton.jsx';
import FileMenu from '../components/FileMenu.jsx';

import styles from '../components/css/TopBar.css';

class TopBar extends React.Component {
  static propTypes = {
    type: React.PropTypes.string.isRequired,
    appState: React.PropTypes.object.isRequired,
    files: React.PropTypes.array.isRequired,
    activeFile: React.PropTypes.object.isRequired,
    className: React.PropTypes.string
  };

  getFullscreenTopBarContents = () => {
    var topBarClassName = [
      styles.topBar,
      this.props.className
    ].join(' ');

    return (
      <div className={topBarClassName}>
        <div className={styles.buttonsContainer}>
          <TopBarButton type={TopBarButtonTypes.PANEL_SWITCH} panelType={this.props.type}
            targetPanelType={PanelTypes.MARKDOWN_SOURCE} appState={this.props.appState}/>
          <TopBarButton type={TopBarButtonTypes.PANEL_SWITCH} panelType={this.props.type}
            targetPanelType={PanelTypes.HTML_SOURCE} appState={this.props.appState}/>
          <TopBarButton type={TopBarButtonTypes.PANEL_SWITCH} panelType={this.props.type}
            targetPanelType={PanelTypes.MARKDOWN_PREVIEW} appState={this.props.appState}/>
          <TopBarButton type={TopBarButtonTypes.FULLSCREEN_OFF} appState={this.props.appState}/>
        </div>
        <FileMenu files={this.props.files} activeFile={this.props.activeFile}/>
      </div>
    );
  };

  getPaneledTopbarContents = (topBarPlacement) => {
    var topBarClassName = [
      styles.topBar,
      this.props.className
    ].join(' ');

    switch (topBarPlacement) {
      case PanelTypes.MARKDOWN_SOURCE:
        return (
          <div className={topBarClassName}>
            <div className={styles.buttonsContainer}>
              <TopBarButton type={TopBarButtonTypes.TOP_PANEL_TOGGLE}
                topPanelType={TopPanelTypes.QUICK_REFERENCE} appState={this.props.appState}/>
              <TopBarButton type={TopBarButtonTypes.TOP_PANEL_TOGGLE}
                topPanelType={TopPanelTypes.ABOUT} appState={this.props.appState}/>
              <TopBarButton type={TopBarButtonTypes.FULLSCREEN_ON}
                panelType={this.props.type} appState={this.props.appState}/>
            </div>
            <FileMenu files={this.props.files} activeFile={this.props.activeFile}/>
          </div>
        );

      case PanelTypes.MARKDOWN_PREVIEW:
        return (
          <div className={topBarClassName}>
            <div className={styles.buttonsContainer}>
              <TopBarButton type={TopBarButtonTypes.PANEL_SWITCH} panelType={this.props.type}
                targetPanelType={PanelTypes.HTML_SOURCE} appState={this.props.appState}/>
              <TopBarButton type={TopBarButtonTypes.PANEL_SWITCH} panelType={this.props.type}
                targetPanelType={PanelTypes.MARKDOWN_PREVIEW} appState={this.props.appState}/>
              <TopBarButton type={TopBarButtonTypes.FULLSCREEN_ON} panelType={this.props.type}
                appState={this.props.appState}/>
            </div>
          </div>
        );

      case PanelTypes.HTML_SOURCE:
        return (
          <div className={topBarClassName}>
            <div className={styles.buttonsContainer}>
            <TopBarButton type={TopBarButtonTypes.PANEL_SWITCH} panelType={this.props.type}
              targetPanelType={PanelTypes.HTML_SOURCE} appState={this.props.appState}/>
            <TopBarButton type={TopBarButtonTypes.PANEL_SWITCH} panelType={this.props.type}
              targetPanelType={PanelTypes.MARKDOWN_PREVIEW} appState={this.props.appState}/>
            <TopBarButton type={TopBarButtonTypes.FULLSCREEN_ON} panelType={this.props.type}
              appState={this.props.appState}/>
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
