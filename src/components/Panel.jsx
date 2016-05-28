import React from 'react';
import { PanelTypes } from '../constants/AppConstants';
import TopBar from '../components/TopBar.jsx';
import TopPanel from '../components/TopPanel.jsx';
import MarkdownSource from '../components/MarkdownSource.jsx';
import MarkdownPreview from '../components/MarkdownPreview.jsx';
import HtmlSource from '../components/HtmlSource.jsx';
import { EditorState } from 'draft-js';

import styles from '../components/css/Panel.css';

const Panel = (props) => {
  var { visibleTopPanel } = props.appState;
  var { fontSizeOffset } = props.settingsState;
  var shouldDisplayTopPanel =
    visibleTopPanel !== null && props.type === PanelTypes.MARKDOWN_SOURCE;
  var panelContents;

  switch (props.type) {
    case PanelTypes.MARKDOWN_SOURCE:
      panelContents = (
        <MarkdownSource editorState={props.editorState} fontSizeOffset={fontSizeOffset} />
      );
      break;

    case PanelTypes.MARKDOWN_PREVIEW:
      panelContents = (
        <MarkdownPreview markdown={props.markdown} fontSizeOffset={fontSizeOffset} />
      );
      break;

    case PanelTypes.HTML_SOURCE:
      panelContents = (
        <HtmlSource markdown={props.markdown} fontSizeOffset={fontSizeOffset} />
      );
      break;

    default:
      break;
  }

  return (
    <div className={styles.panel}>
      {shouldDisplayTopPanel ?
        <TopPanel type={visibleTopPanel} settingsState={props.settingsState} /> : ''}

      <TopBar className={styles.topBar} {...props} />

      {panelContents}
    </div>
  );
};

Panel.propTypes = {
  type: React.PropTypes.string.isRequired,
  editorState: React.PropTypes.instanceOf(EditorState).isRequired,
  markdown: React.PropTypes.string.isRequired,
  appState: React.PropTypes.object.isRequired,
  settingsState: React.PropTypes.object.isRequired,
  files: React.PropTypes.array.isRequired,
  activeFile: React.PropTypes.object.isRequired,
};

export default Panel;
