# Minimalist Markdown Editor for Chrome

This is the source for the **simplest** and **slickest** Markdown editor for Chrome (both the browser and the OS). [Download on the Chrome Web Store.](https://chrome.google.com/webstore/detail/minimalist-markdown-edito/pghodfjepegmciihfhdipmimghiakcjf)  
Just write Markdown and see what it looks like as you type. And convert it to HTML in one click.

## The Minimalist Markdown Editor project

The Minimalist Markdown Editor project is available both online as a web app, and offline and with file support as a Chrome app:

- [Web app](http://markdown.pioul.fr) ([GitHub repository](https://github.com/pioul/Minimalist-Online-Markdown-Editor))
- [Chrome app](https://chrome.google.com/webstore/detail/minimalist-markdown-edito/pghodfjepegmciihfhdipmimghiakcjf) (the source code is in this repo)

## Contributing

### Building

1. Ensure that [Node.js](http://nodejs.org/) is installed, and open a terminal in the project's root directory.
2. Run `npm install` to install the project's developement dependencies.
3. Run `npm run build` to build the Chrome app. The builds will be placed in the `dist/` directory.

Note: Building should only be necessary if you think about contributing. If you want to run one of the apps, hit one of the links above.

### Git workflow

The two project branches share a decent amount of code. This common source code sits in `app-shared/` in each of these repos. As you can see from the commit history, changes to files in- and outside of `app-shared/` are committed separately to help with cherry-picking the common source changes from the other repo afterward.

E.g. You've made changes to `src/css/main.css` and `src/app-shared/css/main.css`. Since changes have been made to files in- and outside of `app-shared/`, instead of committing all changes at once, make two commits:

1. The first one will be called "[app-shared] commit_message", and will commit changes to `src/app-shared/css/main.css`.
2. The second one will be called "commit_message", and will commit changes to `src/css/main.css`.

If changes had only been made to `src/css/main.css`, then there would've been no need for the first commit. And if changes had only been made to `src/app-shared/css/main.css`, there would've been no need for the second commit.

That's really all there is to know about this project's Git workflow, so fork away!

### A word about ES6+ and target envs

ES6's feature set is frozen, and the standard should be published by June 2015; ES7 is also moving forward. Lots of [ES6+ features](http://kangax.github.io/compat-table/es6/) have been implemented in major JavaScript engines (including V8, Chrome's JS engine), which means they can already be used pretty safely.

Currently, only the Chrome app is authored using ES6+. That means the shared source code between the two apps (in `app-shared/`) has to be authored in ES5.

The suggested dev environment for the Chrome app is [Chrome Canary](https://www.google.com/chrome/browser/canary.html). That's because V8 implements features at a good pace, and since the target engine is V8 (after all, we're talking about a Chrome app), we might as well work with what we have in V8 and avoid polyfills and their downsides.

Also, since some ES6+ features are hidden behind the "Enable Experimental JavaScript" flag in Chrome and that Canary may support more features than Stable, part of the build process consists in transpiling the ES6+ source to ES5.

Summary:

- Dev env (running `src/`, authored in ES6+, no polyfills): Chrome Canary with "Enable Experimental JavaScript" flag enabled
- Target env (running `dist/`, transpiled to ES5, no polyfills): Chrome (browser or OS)
- Target env in `app-shared/` (authored in ES5): all major browsers, down to IE9

## Edge cases

### Are symlinks supported?

Unfortunately, the Chrome API through which MME accesses the filesystem isn't consistent regarding symlinks. What I've observed:

- On Windows:
	- File shortcuts: work as expected
	- File soft links: can't read + can't detect dupes
	- File hard links: can't detect dupes
	- Files inside linked directory: can't detect dupes
- On Linux: *haven't tested, feel free to test and send a PR*
- On Mac: *haven't tested, feel free to test and send a PR*
- On ChromeOS: *haven't tested, feel free to test and send a PR*

### Encoding

Like most software nowadays, MME uses UTF-8 to read from and write to files. It currently doesn't support other charsets.

If you happen to want to open in MME a non-UTF-8 file, it probably won't be read properly. To fix that, open it using the original program or another text editor, and paste its contents in MME: it'll display properly and subsequent saves will save the file as UTF-8.

If you must work with non-UTF-8 files on a regular basis though, please get in touch so that we can discuss your particular use-case.

### Undo manager

A JS-based undo manager is used in place of the native one. That means you can only use keyboard shortcuts to undo/redo, not native commands such as the ones that appear in context menus.