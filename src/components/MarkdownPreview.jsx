import React from 'react';
import MarkdownPreviewMarkup from '../components/MarkdownPreviewMarkup.jsx';

import styles from './css/MarkdownPreview.css';

const MarkdownPreview = (props) => {
  const defaultFontSize = 14;
  const dynamicStyles = {
    fontSize: defaultFontSize + props.fontSizeOffset,
  };

  return (
    <div className={styles.preview} style={dynamicStyles}>
      <MarkdownPreviewMarkup markdown={props.markdown} />
    </div>
  );
};

MarkdownPreview.propTypes = {
  markdown: React.PropTypes.string.isRequired,
  fontSizeOffset: React.PropTypes.number.isRequired,
};

export default MarkdownPreview;
