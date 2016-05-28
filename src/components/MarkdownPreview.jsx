import React from 'react';
import MarkdownParser from '../utils/MarkdownParser';

import styles from './css/MarkdownPreview.css';

const createPreviewMarkup = (markdown) => {
  const html = MarkdownParser.render(markdown);
  return ({ __html: html });
};

const MarkdownPreview = (props) => {
  const defaultFontSize = 14;
  const dynamicStyles = {
    fontSize: defaultFontSize + props.fontSizeOffset,
  };

  return (
    <div
      className={styles.preview} style={dynamicStyles}
      dangerouslySetInnerHTML={createPreviewMarkup(props.markdown)}
    />
  );
};

MarkdownPreview.propTypes = {
  markdown: React.PropTypes.string.isRequired,
  fontSizeOffset: React.PropTypes.number.isRequired,
};

export default MarkdownPreview;
