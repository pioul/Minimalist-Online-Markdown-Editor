import MarkdownIt from 'markdown-it';

class MarkdownParser {
  static parser = new MarkdownIt();

  static render = (markdown) => MarkdownParser.parser.render(markdown);
}

export default MarkdownParser;
