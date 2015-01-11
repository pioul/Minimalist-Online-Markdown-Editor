# Minimalist Online Markdown Editor

This is the source for the **simplest** and **slickest** online Markdown editor, available online here: http://markdown.pioul.fr  
Just write Markdown and see what it looks like as you type. And convert it to HTML in one click.

## The Minimalist Markdown Editor project

The Minimalist Markdown Editor project is available both online as a web app, and offline and with file support as a Chrome app:

- [Web app](http://markdown.pioul.fr) (the source code is in this repo)
- [Chrome app](https://chrome.google.com/webstore/detail/minimalist-markdown-edito/pghodfjepegmciihfhdipmimghiakcjf) ([GitHub repository](https://github.com/pioul/Minimalist-Markdown-Editor-for-Chrome))

## Contributing

### Git workflow

The two project branches share a decent amount of code. This common source code sits in `app-shared/` in each of these repos. As you can see from the commit history, changes to files in- and outside of `app-shared/` are committed separately to help with cherry-picking the common source changes from the other repo afterward.

E.g. You've made changes to `css/main.css` and `app-shared/css/main.css`. Since changes have been made to files in- and outside of `app-shared/`, instead of committing all changes at once, make two commits:

1. The first one will be called "[app-shared] commit_message", and will commit changes to `app-shared/css/main.css`.
2. The second one will be called "commit_message", and will commit changes to `css/main.css`.

If changes had only been made to `css/main.css`, then there would've been no need for the first commit. And if changes had only been made to `app-shared/css/main.css`, there would've been no need for the second commit.

That's really all there is to know about this project's Git workflow, so fork away!

### Target env

We aim at compatibility down to IE8.

The source for this app is currently authored in ES5, with ES5 polyfills when needed. I'm thinking about authoring in ES6+ and transpiling + polyfilling, but that'd require lots of carefully picked ES6+ polyfills to run in most browsers, so I'm waiting for a good reason to do so.