import React from 'react';
import { PanelTypes, PanelNames } from '../constants/AppConstants';
import AppActionCreators from '../action-creators/AppActionCreators';

class TopBar extends React.Component {
  static propTypes = {
    type: React.PropTypes.string.isRequired,
    appState: React.PropTypes.object.isRequired
  };

  onPanelSwitchClick = (newPanelType) => {
    var currentPanelType = this.props.type;
    AppActionCreators.switchPanel(currentPanelType, newPanelType);
  };

  onEnterFullscreenButtonClick = (panelType) => AppActionCreators.makePanelEnterFullscreen(panelType);
  onExitFullscreenButtonClick = () => AppActionCreators.makePanelExitFullscreen();

  getFullscreenTopBarContents = () => {
    return (
      <div>
        <button onClick={this.onPanelSwitchClick.bind(this, PanelTypes.MARKDOWN_SOURCE)}>
          {PanelNames.MARKDOWN_SOURCE}
        </button>
        <button onClick={this.onPanelSwitchClick.bind(this, PanelTypes.HTML_SOURCE)}>
          {PanelNames.HTML_SOURCE}
        </button>
        <button onClick={this.onPanelSwitchClick.bind(this, PanelTypes.MARKDOWN_PREVIEW)}>
          {PanelNames.MARKDOWN_PREVIEW}
        </button>
        <button className="icon-fullscreen" onClick={this.onExitFullscreenButtonClick}/>
      </div>
    );
  };

  getPaneledTopbarContents = (topBarPlacement) => {
    switch (topBarPlacement) {
      case PanelTypes.MARKDOWN_SOURCE:
        return (
          <button className="icon-fullscreen"
            onClick={this.onEnterFullscreenButtonClick.bind(this, PanelTypes.MARKDOWN_SOURCE)} />
        );

      case PanelTypes.MARKDOWN_PREVIEW:
        return (
          <div>
            <button onClick={this.onPanelSwitchClick.bind(this, PanelTypes.HTML_SOURCE)}>
              {PanelNames.HTML_SOURCE}
            </button>
            <button onClick={this.onPanelSwitchClick.bind(this, PanelTypes.MARKDOWN_PREVIEW)}>
              {PanelNames.MARKDOWN_PREVIEW}
            </button>
            <button className="icon-fullscreen"
              onClick={this.onEnterFullscreenButtonClick.bind(this, PanelTypes.MARKDOWN_PREVIEW)} />
          </div>
        );

      case PanelTypes.HTML_SOURCE:
        return (
          <div>
            <button onClick={this.onPanelSwitchClick.bind(this, PanelTypes.HTML_SOURCE)}>
              {PanelNames.HTML_SOURCE}
            </button>
            <button onClick={this.onPanelSwitchClick.bind(this, PanelTypes.MARKDOWN_PREVIEW)}>
              {PanelNames.MARKDOWN_PREVIEW}
            </button>
            <button className="icon-fullscreen"
              onClick={this.onEnterFullscreenButtonClick.bind(this, PanelTypes.HTML_SOURCE)} />
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
