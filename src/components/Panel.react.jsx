'use strict';

import React from 'react';
import { PanelTypes } from '../constants/AppConstants';
import TopBar from '../components/TopBar.react.jsx';
import MarkdownSource from '../components/MarkdownSource.react.jsx';
import MarkdownPreview from '../components/MarkdownPreview.react.jsx';
import HtmlSource from '../components/HtmlSource.react.jsx';

class Panel extends React.Component {
  static propTypes = {
    type: React.PropTypes.string.isRequired,
    markdown: React.PropTypes.string.isRequired,
    html: React.PropTypes.string.isRequired
  };

  render() {
    var panelContents;

    switch (this.props.type) {
      case PanelTypes.MARKDOWN_SOURCE:
        panelContents = <MarkdownSource markdown={this.props.markdown} />;
        break;

      case PanelTypes.MARKDOWN_PREVIEW:
        panelContents = <MarkdownPreview html={this.props.html} />;
        break;

      case PanelTypes.HTML_SOURCE:
        panelContents = <HtmlSource html={this.props.html} />;
        break;
    }

    return (
      <div>
        <div>
          <TopBar {...this.props}/>

          {panelContents}
        </div>
      </div>
    );
  }
}

export default Panel;
