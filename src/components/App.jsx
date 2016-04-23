import React from 'react';
import AppStore from '../stores/AppStore';
import Panel from '../components/Panel.jsx';

import './css/global-styles/document-styles.css';
import styles from './css/App.css';

function getAppState() {
  return {
    markdown: AppStore.getMarkdown(),
    html: AppStore.getHtml(),

    appState: AppStore.getAppState()
  };
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = getAppState();
  }

  componentDidMount = () => AppStore.addChangeListener(this.onStoreChange);
  componentWillUnmount = () => AppStore.removeChangeListener(this.onStoreChange);
  onStoreChange = () => this.setState(getAppState());

  render() {
    var { appState, markdown, html } = this.state;

    return (
      <div className={styles.app}>
        { appState.visiblePanels.map((panelType) =>
          <Panel type={panelType} markdown={markdown} html={html} appState={appState} />) }
      </div>
    );
  }
}

export default App;
