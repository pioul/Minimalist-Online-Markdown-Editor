import React from 'react';

import styles from './css/MarkdownPreview.css';

const createPreviewMarkup = (html) => ({ __html: html });

const MarkdownPreview = (props) => (
  <div className={styles.preview} dangerouslySetInnerHTML={createPreviewMarkup(props.html)} />
);

MarkdownPreview.propTypes = {
  html: React.PropTypes.string.isRequired,
};

export default MarkdownPreview;
