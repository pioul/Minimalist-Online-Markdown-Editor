import React from 'react';
import { PanelTypes } from '../constants/AppConstants';
import AppActionCreators from '../action-creators/AppActionCreators';

class TopBar extends React.Component {
  static propTypes = {
    type: React.PropTypes.string.isRequired
  };

  onFullscreenButtonClick = (panelType) => AppActionCreators.toggleFullscreen(panelType);

  render() {
    var topBarContents;

    switch (this.props.type) {
      case PanelTypes.MARKDOWN_SOURCE:
        topBarContents = (
          <button className="icon-fullscreen"
            onClick={this.onFullscreenButtonClick.bind(this, PanelTypes.MARKDOWN_SOURCE)} />
        );
        break;

      case PanelTypes.MARKDOWN_PREVIEW:
        topBarContents = (
          <button className="icon-fullscreen"
            onClick={this.onFullscreenButtonClick.bind(this, PanelTypes.MARKDOWN_PREVIEW)} />
        );
        break;

      case PanelTypes.HTML_SOURCE:
        topBarContents = (
          <button className="icon-fullscreen"
            onClick={this.onFullscreenButtonClick.bind(this, PanelTypes.HTML_SOURCE)} />
        );
        break;
    }

    return (
      <div>
        {topBarContents}
      </div>
    );
  }
}

export default TopBar;
