import React from 'react';
import FileActionCreators from '../action-creators/FileActionCreators';

import styles from '../components/css/QuickReference.css';

const onCodeSnippetClick = (e) => {
  var markdown = '\n\n' + e.currentTarget.textContent;
  FileActionCreators.appendToMarkdownSource(markdown);
};

const QuickReference = () => (
  <div className={styles.quickReference}>
    <h2>Quick Reference</h2>

    <table>
      <tbody>
        <tr>
          <td onClick={onCodeSnippetClick}>
            <pre><code><span className={styles.highlightedCode}>*</span>
              This is italicized<span className={styles.highlightedCode}>*</span>, <wbr />
              and <span className={styles.highlightedCode}>**</span>this is
              bold<span className={styles.highlightedCode}>**</span>.</code></pre>
          </td>
          <td><p>Use <code>*</code> or <code>_</code> for emphasis.</p></td>
        </tr><tr>
          <td onClick={onCodeSnippetClick}>
            <pre><code><span className={styles.highlightedCode}>
            #</span> This is a first level header</code></pre>
          </td>
          <td><p>Use one or more hash marks for headers: <code>#&nbsp;H1</code>
            , <code>##&nbsp;H2</code>, <code>###&nbsp;H3</code>…</p></td>
        </tr><tr>
          <td onClick={onCodeSnippetClick}>
            <pre><code>This is a link to <wbr /><span className={styles.highlightedCode}>
            [Google](http://www.google.com)</span></code></pre>
          </td>
          <td><p></p></td>
        </tr><tr>
          <td onClick={onCodeSnippetClick}>
            <pre><code>First line.<span className={styles.highlightedCode}>{'  '}</span>{'\n'}
            Second line.</code></pre>
          </td>
          <td><p>End a line with two spaces for a linebreak.</p></td>
        </tr><tr>
          <td onClick={onCodeSnippetClick}>
            <pre><code><span className={styles.highlightedCode}>- </span>
              Unordered list item{'\n'}
              <span className={styles.highlightedCode}>
              - </span>Unordered list item</code></pre>
          </td>
          <td><p>Unordered (bulleted) lists use asterisks, pluses, or hyphens
            (<code>*</code>, <code>+</code>, or <code>-</code>) as list markers.</p></td>
        </tr><tr>
          <td onClick={onCodeSnippetClick}>
            <pre><code><span className={styles.highlightedCode}>1. </span>Ordered list item{'\n'}
              <span className={styles.highlightedCode}>2. </span>Ordered list item</code></pre>
          </td>
          <td><p>Ordered (numbered) lists use regular numbers, followed by periods,
          as list markers.</p></td>
        </tr><tr>
          <td onClick={onCodeSnippetClick}><pre><code><span className={styles.highlightedCode}>
            {'    '}</span>/* This is a code block */</code></pre></td>
          <td><p>Indent four spaces for a preformatted block.</p></td>
        </tr><tr>
          <td onClick={onCodeSnippetClick}><pre><code>Let's talk about{' '}
            <span className={styles.highlightedCode}>`</span>&lt;html&gt;
            <span className={styles.highlightedCode}>`</span>!</code></pre></td>
          <td><p>Use backticks for inline code.</p></td>
        </tr><tr>
          <td onClick={onCodeSnippetClick}>
            <pre><code><span className={styles.highlightedCode}>
            ![](http://w3.org/Icons/valid-xhtml10)</span></code></pre>
          </td>
          <td><p>Images are exactly like links, with an exclamation mark in front of them.</p></td>
        </tr>
      </tbody>
    </table>

    <p className={styles.p}>
      <a
        href="http://daringfireball.net/projects/markdown/syntax"
        target="_blank"
      >
        Full Markdown documentation
      </a>
    </p>
  </div>
);

export default QuickReference;
