import './css/global-styles/document-styles.css'; // Order of this import matters
import styles from './css/App.css';

import React from 'react';
import AppStore from '../stores/AppStore';
import Panel from '../components/Panel.jsx';

var getAppState = () => AppStore.getState();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = getAppState();
  }

  componentDidMount = () => AppStore.addChangeListener(this.onStoreChange);
  componentWillUnmount = () => AppStore.removeChangeListener(this.onStoreChange);
  onStoreChange = () => this.setState(getAppState());

  render() {
    var { appState, markdown, html, caretPos } = this.state;

    return (
      <div className={styles.app}>
        { appState.visiblePanels.map((panelType) =>
          <Panel type={panelType} markdown={markdown} html={html}
            caretPos={caretPos} appState={appState} />) }
      </div>
    );
  }
}

export default App;
