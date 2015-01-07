# MME-shared

This repository contains the code shared between the two branches of the Minimalist Markdown Editor project:

- [Web app](http://markdown.pioul.fr) ([GitHub repository](https://github.com/pioul/Minimalist-Online-Markdown-Editor))
- [Chrome app](https://chrome.google.com/webstore/detail/minimalist-markdown-edito/pghodfjepegmciihfhdipmimghiakcjf) ([GitHub repository](https://github.com/pioul/Minimalist-Markdown-Editor-for-Chrome))

The code they share isn't usable on its own – it's been separated from the two projects to ease their maintenance, but hasn't been made into a standalone API for the time being.
If you want to create a new project from this editor's source, fork one of the two branches above and start from here. This shared code is regularly synced in and out of these two projects using [subtrees](https://github.com/apenwarr/git-subtree/blob/master/git-subtree.txt), so you shouldn't need to care about it: all the code you care about is effectively in one of these two repos.
