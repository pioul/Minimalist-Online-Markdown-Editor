import React from 'react';

import styles from './css/HtmlSource.css';

const HtmlSource = (props) => {
  const defaultFontSize = 11;
  const dynamicStyles = {
    fontSize: defaultFontSize + props.fontSizeOffset,
  };

  return (
    <textarea
      className={styles.textarea} value={props.html}
      style={dynamicStyles} readOnly
    />
  );
};

HtmlSource.propTypes = {
  html: React.PropTypes.string.isRequired,
  fontSizeOffset: React.PropTypes.number.isRequired,
};

export default HtmlSource;
