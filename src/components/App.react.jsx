'use strict';

import React from 'react';
import AppStore from '../stores/AppStore';

function getAppState() {
  return {};
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
        Hey!
      </div>
    );
  }
}

export default App;
