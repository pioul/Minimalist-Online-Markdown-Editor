'use strict';

import React from 'react';

class MarkdownPreview extends React.Component {
  static propTypes = {
    html: React.PropTypes.string.isRequired
  };

  createPreviewMarkup = () => ({ __html: this.props.html });

  render() {
    return (
      <div dangerouslySetInnerHTML={this.createPreviewMarkup()} />
    );
  }
}

export default MarkdownPreview;
