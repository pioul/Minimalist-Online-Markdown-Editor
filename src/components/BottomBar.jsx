import React from 'react';

import styles from './css/BottomBar.css';

const WORD_REGEX = /(\w+)/g;

const getWordCount = (markdown) => {
  const wordMatches = markdown.match(WORD_REGEX);
  const wordCount = wordMatches ? wordMatches.length : 0;
  const formattedWordCount =
    wordCount.toLocaleString() + ' word' + (wordCount > 1 ? 's' : '');

  return formattedWordCount;
};

const BottomBar = (props) => {
  const wordCount = getWordCount(props.markdown);

  return (
    <div className={styles.bottomBar}>
      <span>{wordCount}</span>
    </div>
  );
};

BottomBar.propTypes = {
  markdown: React.PropTypes.string.isRequired,
};

export default BottomBar;
