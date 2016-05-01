import React from 'react';
import FileActionCreators from '../action-creators/FileActionCreators';

import styles from './css/MarkdownSource.css';

class MarkdownSource extends React.Component {
  static propTypes = {
    markdown: React.PropTypes.string.isRequired,
    caretPos: React.PropTypes.array.isRequired,
  };

  componentDidUpdate() {
    this.refs.textarea.setSelectionRange(...this.props.caretPos);
    this.refs.textarea.focus();
  }

  onInput = (e) => {
    var textarea = e.target;
    var markdown = textarea.value;
    var caretPos = [textarea.selectionStart, textarea.selectionEnd];

    FileActionCreators.updateMarkdown(markdown, caretPos);
  };

  render() {
    return (
      <textarea
        className={styles.textarea} ref="textarea"
        value={this.props.markdown} onChange={this.onInput}
      />
    );
  }
}

export default MarkdownSource;
