import React from 'react';
import FileActionCreators from '../action-creators/FileActionCreators';
import FileMenuItem from '../components/FileMenuItem.jsx';
import throttle from 'lodash.throttle';

import styles from '../components/css/FileMenu.css';

class FileMenu extends React.Component {
  static propTypes = {
    files: React.PropTypes.array.isRequired,
    activeFile: React.PropTypes.object.isRequired,
  };

  static SCROLL_STEP = 160;

  constructor(props) {
    super(props);

    this.state = {
      shouldDisplayNavControls: false,
      canScrollLeft: false,
      canScrollRight: false,
    };
  }

  componentDidMount = () => {
    this.updateNavControlsDisplay();
    window.addEventListener('resize', this.updateNavControlsDisplay);
  };

  componentDidUpdate = () => this.updateNavControlsDisplay();

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.updateNavControlsDisplay);
  };

  onFileMenuDoubleClick = (e) => {
    const isClickOnFileMenuItself = e.target === this.refs.fileMenuItemsContainer;
    if (isClickOnFileMenuItself) FileActionCreators.createAndSelectNewFile();
  };

  onFileMenuScroll = () => this.updateNavControlsDisplay();

  onLeftNavControlClick = () => this.scrollBy(-FileMenu.SCROLL_STEP);
  onRightNavControlClick = () => this.scrollBy(FileMenu.SCROLL_STEP);

  scrollBy = (x) => (this.refs.fileMenuItemsContainer.scrollLeft += x);

  updateNavControlsDisplay = throttle(() => {
    const container = this.refs.fileMenuItemsContainer;
    const shouldDisplayNavControls = container.offsetWidth < container.scrollWidth;
    const canScrollLeft = container.scrollLeft > 0;
    const canScrollRight =
      container.scrollLeft < (container.scrollWidth - container.offsetWidth - 1);

    if (shouldDisplayNavControls !== this.state.shouldDisplayNavControls ||
        canScrollLeft !== this.state.canScrollLeft ||
        canScrollRight !== this.state.canScrollRight) {
      this.setState({ shouldDisplayNavControls, canScrollLeft, canScrollRight });
    }
  }, 100);

  render() {
    const { shouldDisplayNavControls, canScrollLeft, canScrollRight } = this.state;

    return (
      <div className={styles.fileMenu}>
        {shouldDisplayNavControls &&
          <button
            className={styles.leftNavControl} onClick={this.onLeftNavControlClick}
            disabled={!canScrollLeft}
          />}

        {shouldDisplayNavControls &&
          <button
            className={styles.rightNavControl} onClick={this.onRightNavControlClick}
            disabled={!canScrollRight}
          />}

        <div
          className={styles.fileMenuItemsContainer} title="Double-click to open new tab"
          onDoubleClick={this.onFileMenuDoubleClick} ref="fileMenuItemsContainer"
          onScroll={this.onFileMenuScroll}
        >
          {this.props.files.map((file) =>
            <FileMenuItem key={file.id} file={file} {...this.props} />)}
        </div>
      </div>
    );
  }
}

export default FileMenu;
