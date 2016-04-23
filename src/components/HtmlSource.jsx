import React from 'react';

class HtmlSource extends React.Component {
  static propTypes = {
    html: React.PropTypes.string.isRequired
  };

  render() {
    return (
      <textarea value={this.props.html} />
    );
  }
}

export default HtmlSource;
