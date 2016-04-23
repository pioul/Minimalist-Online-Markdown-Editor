'use strict';

import MarkdownIt from 'markdown-it';

class MarkdownParser {
  static parser = new MarkdownIt();

  static render = (md) => Promise.resolve(MarkdownParser.parser.render(md));
}

export default MarkdownParser;
