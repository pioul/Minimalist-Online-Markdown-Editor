import React from 'react';
import AppActionCreators from '../action-creators/AppActionCreators';

class MarkdownSource extends React.Component {
  onInput = (e) => AppActionCreators.updateMdSource(e.target.value);

  static propTypes = {
    markdown: React.PropTypes.string.isRequired
  };

  render() {
    return (
      <textarea value={this.props.markdown} onChange={this.onInput} />
    );
  }
}

export default MarkdownSource;
