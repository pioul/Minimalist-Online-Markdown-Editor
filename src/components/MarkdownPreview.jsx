import React from 'react';

import styles from './css/MarkdownPreview.css';

const createPreviewMarkup = (html) => ({ __html: html });

const MarkdownPreview = (props) => {
  const defaultFontSize = 14;
  const dynamicStyles = {
    fontSize: defaultFontSize + props.fontSizeOffset,
  };

  return (
    <div
      className={styles.preview} style={dynamicStyles}
      dangerouslySetInnerHTML={createPreviewMarkup(props.html)}
    />
  );
};

MarkdownPreview.propTypes = {
  html: React.PropTypes.string.isRequired,
  fontSizeOffset: React.PropTypes.number.isRequired,
};

export default MarkdownPreview;
