import React from 'react';
import AppStore from '../stores/AppStore';
import Panel from '../components/Panel.jsx';

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
      <div>
        { appState.visiblePanels.map((panelType) =>
          <Panel type={panelType} markdown={markdown} html={html} />) }
      </div>
    );
  }
}

export default App;
