import React from 'react';

const About = () => (
  <div>
    <h2>About MME</h2>

    <p>Hi, I'm <a href="http://pioul.fr/philippe-masset" target="_blank">Philippe Masset</a>.</p>
    <p>
      I made the Minimalist Online Markdown Editor because I love Markdown
      and simple things.<br />
      The whole source code is on <a href="https://github.com/pioul/Minimalist-Online-Markdown-Editor" target="_blank">GitHub</a>,
      and this editor is also available offline and with file support as
      a <a href="https://chrome.google.com/webstore/detail/minimalist-markdown-edito/pghodfjepegmciihfhdipmimghiakcjf" target="_blank">Chrome app</a>.
    </p>
    <p>
      If you have any suggestions or remarks whatsoever, just click on my
      name above and you'll have plenty of ways of contacting me.
    </p>

    <h3>Privacy</h3>

    <ul>
      <li>No data is sent to any server – everything you type stays inside your browser</li>
      <li>
        The editor automatically saves what you write locally for future use.<br />
        If using a public computer, either empty the left panel before leaving
        the editor or use your browser's privacy mode
      </li>
    </ul>
  </div>
);

export default About;
