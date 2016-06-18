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
  const { visibleTopPanel } = props.appState;
  const { fontSizeOffset } = props.settingsState;
  const panelType = props.type;
  const shouldDisplayTopPanel =
    visibleTopPanel !== null && panelType === PanelTypes.MARKDOWN_SOURCE;

  return (
    <div className={styles.panel}>
      {shouldDisplayTopPanel ?
        <TopPanel type={visibleTopPanel} settingsState={props.settingsState} /> : ''}

      <TopBar className={styles.topBar} {...props} />

      {panelType === PanelTypes.MARKDOWN_SOURCE &&
        <MarkdownSource editorState={props.editorState} fontSizeOffset={fontSizeOffset} />}

      {panelType === PanelTypes.MARKDOWN_PREVIEW &&
        <MarkdownPreview markdown={props.markdown} fontSizeOffset={fontSizeOffset} />}

      {panelType === PanelTypes.HTML_SOURCE &&
        <HtmlSource markdown={props.markdown} fontSizeOffset={fontSizeOffset} />}
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
