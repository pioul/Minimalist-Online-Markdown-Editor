import React from 'react';

import styles from './css/HtmlSource.css';

const HtmlSource = (props) => (
  <textarea className={styles.textarea} value={props.html} readOnly />
);

HtmlSource.propTypes = {
  html: React.PropTypes.string.isRequired,
};

export default HtmlSource;
