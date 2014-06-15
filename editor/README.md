# MME-shared

This repository contains the code shared between two web minimalist Markdown editors:

- [Minimalist Online Markdown Editor](http://markdown.pioul.fr) ([GitHub repository](https://github.com/pioul/Minimalist-Online-Markdown-Editor))
- [Minimalist Markdown Editor for Chrome](https://chrome.google.com/webstore/detail/minimalist-markdown-edito/pghodfjepegmciihfhdipmimghiakcjf)

These two projects are two front-ends for the same editor, of which source is here.

The source isn't usable on its own – it's been separated from the two projects to ease their maintenance, but hasn't been made into a standalone API for the time being.
If you want to create a new web-based project from this editor's source, fork one of the two projects above and start from here. This repo is regularly synced into these two projects' repos using [subtrees](https://github.com/apenwarr/git-subtree/blob/master/git-subtree.txt), so you shouldn't need to care about it.
