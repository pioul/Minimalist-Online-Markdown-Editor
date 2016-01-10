'use strict';

import React from 'react';
import AppStore from '../stores/AppStore';
import MarkdownSource from '../components/MarkdownSource.react.jsx';

function getAppState() {
  return {
    markdown: AppStore.getMarkdown()
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
    return (
      <div>
        <MarkdownSource markdown={this.state.markdown}/>
      </div>
    );
  }
}

export default App;
