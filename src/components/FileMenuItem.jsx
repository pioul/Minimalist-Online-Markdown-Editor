import React from 'react';
import FileActionCreators from '../action-creators/FileActionCreators';
import { getShortString } from '../utils/StringUtils.js';

import styles from '../components/css/FileMenuItem.css';

class FileMenuItem extends React.Component {
  static propTypes = {
    file: React.PropTypes.object.isRequired,
    activeFile: React.PropTypes.object.isRequired,
  };

  componentDidMount = () => {
    const { file, activeFile } = this.props;
    const isActive = file === activeFile;
    if (isActive) this.scrollElementIntoView();
  };

  componentDidUpdate = (prevProps) => {
    const { file, activeFile } = this.props;
    const isActive = file === activeFile;
    const wasActive = file === prevProps.activeFile;
    const wasJustMadeActive = isActive && !wasActive;
    if (wasJustMadeActive) this.scrollElementIntoView();
  };

  onClick = () => FileActionCreators.updateActiveFile(this.props.file);

  onCloseButtonClick = (e) => {
    e.stopPropagation();
    FileActionCreators.closeFile(this.props.file);
  };

  /**
   * The parent's dimensions can change depending on the visibility of
   * navigation controls, so we scroll into view once for immediacy, and a second
   * time after other operations have been completed to give it a chance to
   * scroll into view again if the potential layout changes pushed it out of view.
   */
  scrollElementIntoView = () => {
    this.refs.menuItem.scrollIntoView();
    setImmediate(() => this.refs.menuItem.scrollIntoView());
  };

  render() {
    var { file, activeFile } = this.props;
    var fileName = file.name || 'untitled';
    var isActive = file === activeFile;

    var fileMenuItemClassName = isActive ? styles.activeFileMenuItem : styles.fileMenuItem;
    var shortFileName = getShortString(fileName, 35);
    var title = fileName !== shortFileName ? fileName : '';

    return (
      <div
        className={fileMenuItemClassName} title={title}
        onClick={this.onClick} ref="menuItem"
      >
        <span>{shortFileName}</span>
        <span className={styles.closeButton} onClick={this.onCloseButtonClick}>×</span>
      </div>
    );
  }
}

export default FileMenuItem;
