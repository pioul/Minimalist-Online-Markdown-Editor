import React from 'react';
import MarkdownParser from '../utils/MarkdownParser';

const createPreviewMarkup = (markdown) => {
  const html = MarkdownParser.render(markdown);
  return html; // Will be rendered as is – must be sanitized
};

class MarkdownPreviewMarkup extends React.Component {
  static propTypes = {
    markdown: React.PropTypes.string.isRequired,
  };

  componentDidMount = () => this.renderMarkup(this.props.markdown);

  componentWillReceiveProps(nextProps) {
    if (this.props.markdown === nextProps.markdown) return;
    this.renderMarkup(nextProps.markdown);
  }

  shouldComponentUpdate = () => false; // Take matters in our own hands

  /**
   * innerHTML isn't the most performant at destroying elements. It can be more
   * efficient to destroy elements by removing their parent than to let innerHTML
   * handle that itself, esp. for large numbers of elements (source:
   * http://blog.stevenlevithan.com/archives/faster-than-innerhtml).
   * dangerouslySetInnerHTML uses innerHTML to destroy + create elements, so
   * we're handling that ourselves instead in order to destroy elements faster.
   */
  renderMarkup(markdown) {
    const { markup } = this.refs;
    const newMarkup = markup.cloneNode(false);

    newMarkup.innerHTML = createPreviewMarkup(markdown);
    markup.parentNode.replaceChild(newMarkup, markup);

    this.refs.markup = newMarkup;
  }

  render = () => (
    <div ref="markup" />
  );
}

export default MarkdownPreviewMarkup;
