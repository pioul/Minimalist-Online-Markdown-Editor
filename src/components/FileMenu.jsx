import React from 'react';
import FileActionCreators from '../action-creators/FileActionCreators';
import FileMenuItem from '../components/FileMenuItem.jsx';

import styles from '../components/css/FileMenu.css';

class FileMenu extends React.Component {
  static propTypes = {
    files: React.PropTypes.array.isRequired,
    activeFile: React.PropTypes.object.isRequired
  };

  onFileMenuDoubleClick = () => FileActionCreators.createAndSelectNewFile();

  render() {
    return (
      <div className={styles.fileMenu} title="Double-click to open new tab"
        onDoubleClick={this.onFileMenuDoubleClick}>
        { this.props.files.map((file) =>
            <FileMenuItem file={file} {...this.props}/>) }
      </div>
    );
  }
}

export default FileMenu;
