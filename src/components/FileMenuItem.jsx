import React from 'react';
import FileActionCreators from '../action-creators/FileActionCreators';
import { getShortString } from '../utils/TextManipulation.js';

import styles from '../components/css/FileMenuItem.css';

class FileMenuItem extends React.Component {
  static propTypes = {
    file: React.PropTypes.object.isRequired,
    activeFile: React.PropTypes.object.isRequired
  };

  onClick = () => FileActionCreators.updateActiveFile(this.props.file);

  onCloseButtonClick = (e) => {
    e.stopPropagation();
    FileActionCreators.closeFile(this.props.file);
  };

  render() {
    var { file, activeFile } = this.props;
    var fileName = file.name || 'untitled';
    var isActive = file === activeFile;

    var fileMenuItemClassName = isActive ? styles.activeFileMenuItem : styles.fileMenuItem;
    var shortFileName = getShortString(fileName, 35);
    var title = fileName !== shortFileName ? fileName : '';

    return (
      <div className={fileMenuItemClassName} title={title} onClick={this.onClick}>
        <span className={styles.fileName}>{shortFileName}</span>
        <span className={styles.closeButton} onClick={this.onCloseButtonClick}>×</span>
      </div>
    );
  }
}

export default FileMenuItem;
