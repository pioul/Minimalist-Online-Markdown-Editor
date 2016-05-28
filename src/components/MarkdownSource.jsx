import React from 'react';
import FileActionCreators from '../action-creators/FileActionCreators';
import { Editor, EditorState } from 'draft-js';

import styles from './css/MarkdownSource.css';

class MarkdownSource extends React.Component {
  static propTypes = {
    editorState: React.PropTypes.instanceOf(EditorState).isRequired,
    fontSizeOffset: React.PropTypes.number.isRequired,
  };

  onEditorContainerClick = (e) => {
    const isClickOnContainerItself = e.target === this.refs.editorContainer;
    if (isClickOnContainerItself) FileActionCreators.moveFocusToEnd();
  }

  onChange = (editorState) => FileActionCreators.updateEditorState(editorState);

  render() {
    const defaultFontSize = 11;
    const dynamicStyles = {
      fontSize: defaultFontSize + this.props.fontSizeOffset,
    };

    return (
      <div
        className={styles.editorContainer} onClick={this.onEditorContainerClick}
        ref="editorContainer" style={dynamicStyles}
      >
        <Editor
          editorState={this.props.editorState} onChange={this.onChange}
          ref="editor" placeholder="Write Markdown" spellCheck stripPastedStyles
        />
      </div>
    );
  }
}

export default MarkdownSource;
