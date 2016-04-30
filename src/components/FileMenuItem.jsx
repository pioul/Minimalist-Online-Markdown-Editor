import React from 'react';
import { getShortString } from '../utils/TextManipulation.js';

import styles from '../components/css/FileMenuItem.css';

class FileMenuItem extends React.Component {
  static propTypes = {
    file: React.PropTypes.object.isRequired,
    activeFile: React.PropTypes.object.isRequired
  };

  render() {
    var { file, activeFile } = this.props;
    var fileName = file.name || 'untitled';
    var isActive = file === activeFile;

    var fileMenuItemClassName = isActive ? styles.activeFileMenuItem : styles.fileMenuItem;
    var shortFileName = getShortString(fileName, 35);
    var title = fileName !== shortFileName ? fileName : '';

    return (
      <div className={fileMenuItemClassName} title={title}>
				<span className={styles.fileName}>{shortFileName}</span>
				<span className={styles.closeButton}>×</span>
			</div>
    );
  }
}

export default FileMenuItem;
