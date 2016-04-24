import React from 'react';

import styles from './css/MarkdownPreview.css';

class MarkdownPreview extends React.Component {
  static propTypes = {
    html: React.PropTypes.string.isRequired
  };

  createPreviewMarkup = () => ({ __html: this.props.html });

  render() {
    return (
      <div className={styles.preview} dangerouslySetInnerHTML={this.createPreviewMarkup()} />
    );
  }
}

export default MarkdownPreview;
