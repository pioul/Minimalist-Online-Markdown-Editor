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
    className: React.PropTypes.string,
  };

  getFullscreenTopBarContents = () => {
    const topBarClassName = [
      styles.topBar,
      this.props.className,
    ].join(' ');

    return (
      <div className={topBarClassName}>
        <div className={styles.buttonsContainer}>
          <TopBarButton
            type={TopBarButtonTypes.PANEL_SWITCH} panelType={this.props.type}
            targetPanelType={PanelTypes.MARKDOWN_SOURCE} appState={this.props.appState}
          />
          <TopBarButton
            type={TopBarButtonTypes.PANEL_SWITCH} panelType={this.props.type}
            targetPanelType={PanelTypes.HTML_SOURCE} appState={this.props.appState}
          />
          <TopBarButton
            type={TopBarButtonTypes.PANEL_SWITCH} panelType={this.props.type}
            targetPanelType={PanelTypes.MARKDOWN_PREVIEW} appState={this.props.appState}
          />
          <TopBarButton type={TopBarButtonTypes.FULLSCREEN_OFF} />
        </div>
        <FileMenu files={this.props.files} activeFile={this.props.activeFile} />
      </div>
    );
  };

  getPaneledTopBarContents = (topBarPlacement) => {
    const topBarClassName = [
      styles.topBar,
      this.props.className,
    ].join(' ');

    let paneledTopBarContents;

    switch (topBarPlacement) {
      case PanelTypes.MARKDOWN_SOURCE:
        paneledTopBarContents = (
          <div className={topBarClassName}>
            <div className={styles.buttonsContainer}>
              <TopBarButton
                type={TopBarButtonTypes.TOP_PANEL_TOGGLE}
                topPanelType={TopPanelTypes.QUICK_REFERENCE} appState={this.props.appState}
              />
              <TopBarButton
                type={TopBarButtonTypes.TOP_PANEL_TOGGLE}
                topPanelType={TopPanelTypes.ABOUT} appState={this.props.appState}
              />
              <TopBarButton
                type={TopBarButtonTypes.TOP_PANEL_TOGGLE}
                topPanelType={TopPanelTypes.SETTINGS} appState={this.props.appState}
              />
              <TopBarButton
                type={TopBarButtonTypes.FULLSCREEN_ON} panelType={this.props.type}
              />
            </div>
            <FileMenu files={this.props.files} activeFile={this.props.activeFile} />
          </div>
        );
        break;

      case PanelTypes.MARKDOWN_PREVIEW:
        paneledTopBarContents = (
          <div className={topBarClassName}>
            <div className={styles.buttonsContainer}>
              <TopBarButton
                type={TopBarButtonTypes.PANEL_SWITCH} panelType={this.props.type}
                targetPanelType={PanelTypes.HTML_SOURCE} appState={this.props.appState}
              />
              <TopBarButton
                type={TopBarButtonTypes.PANEL_SWITCH} panelType={this.props.type}
                targetPanelType={PanelTypes.MARKDOWN_PREVIEW} appState={this.props.appState}
              />
              <TopBarButton
                type={TopBarButtonTypes.FULLSCREEN_ON} panelType={this.props.type}
              />
            </div>
          </div>
        );
        break;

      case PanelTypes.HTML_SOURCE:
        paneledTopBarContents = (
          <div className={topBarClassName}>
            <div className={styles.buttonsContainer}>
              <TopBarButton
                type={TopBarButtonTypes.PANEL_SWITCH} panelType={this.props.type}
                targetPanelType={PanelTypes.HTML_SOURCE} appState={this.props.appState}
              />
              <TopBarButton
                type={TopBarButtonTypes.PANEL_SWITCH} panelType={this.props.type}
                targetPanelType={PanelTypes.MARKDOWN_PREVIEW} appState={this.props.appState}
              />
              <TopBarButton
                type={TopBarButtonTypes.FULLSCREEN_ON} panelType={this.props.type}
              />
            </div>
          </div>
        );
        break;

      default:
        break;
    }

    return paneledTopBarContents;
  };

  render() {
    const isFullscreen = this.props.appState.visiblePanels.length === 1;

    return isFullscreen ?
      this.getFullscreenTopBarContents() :
      this.getPaneledTopBarContents(this.props.type);
  }
}

export default TopBar;
