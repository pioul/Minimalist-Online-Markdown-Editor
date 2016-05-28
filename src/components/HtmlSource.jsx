import React from 'react';
import MarkdownParser from '../utils/MarkdownParser';

import styles from './css/HtmlSource.css';

const HtmlSource = (props) => {
  const defaultFontSize = 11;
  const dynamicStyles = {
    fontSize: defaultFontSize + props.fontSizeOffset,
  };
  const html = MarkdownParser.render(props.markdown);

  return (
    <textarea
      className={styles.textarea} value={html}
      style={dynamicStyles} readOnly
    />
  );
};

HtmlSource.propTypes = {
  markdown: React.PropTypes.string.isRequired,
  fontSizeOffset: React.PropTypes.number.isRequired,
};

export default HtmlSource;
