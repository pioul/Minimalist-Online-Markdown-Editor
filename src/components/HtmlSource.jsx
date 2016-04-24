import React from 'react';

import styles from './css/HtmlSource.css';

class HtmlSource extends React.Component {
  static propTypes = {
    html: React.PropTypes.string.isRequired
  };

  render() {
    return (
      <textarea className={styles.textarea} value={this.props.html} readOnly />
    );
  }
}

export default HtmlSource;
