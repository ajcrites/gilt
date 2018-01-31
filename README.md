# gilt (pre alpha)
`gilt` is an interactive command line tool for working with `git`.

`gilt` is an interactive command line tool for working with `git`. Don't feel
*guilty* about using the command line for version control! Feel `gilt`y.
I generally work in the terminal and use `git` on the command line. This does
most of what I need it to do, but I always felt a little guilty watching some
of my peers use cool `git` GUIs and be able to do some nice things like view
diffs or checkout commits with a single click whereas I would have to copy some
output into new commands to do this as an extra step.

I haven't found an equivalent command line interactive git tool that has all
the functionality I wanted, so I decided to create one. I bring you `gilt`,
built using [blessed](https://www.npmjs.com/package/blessed).

Don't feel _guilty_ about using the command line for version control!
Feel `gilt`y.

## Purpose
`gilt` was created as a command line alternative for interactive git GUIs. It
attempts to simplify navigating and working with git in common ways while not
losing any git command line functionality or flexibility at all.

Essentially what `gilt` does is run your intended git command, parse its
output, and lay over an interactive TUI (terminal user interface).

`gilt` is _not_ currently intended to a full wrapper for `git` and passes
commands through as a convenience. Please continue to use `git` as your command
for your normal workflows and use `gilt` when you want its special
functionality.

## Usage
```
gilt [git-command]
```

For example, use `gilt log --pretty=oneline` or `gilt status -s`.

See below for a list of available gilt commands.

Most commands allow scrolling through selected blocks (commit hashes, files,
etc.) using <kbd>j</kbd>/<kbd>down</kbd> and <kbd>k</kbd>/<kbd>up</kbd>.
Default interaction is done through <kbd>Enter</kbd>.

You may quit `gilt` at any time using any of <kbd>q</kbd> <kbd>Esc</kbd>, or
<kbd>Ctrl</kbd><kbd>c</kbd>.

## Installation
You will need Node.js to run gilt. _It's only been tested on 9.4 at this point,
but it should work with most newer versions_.

```
yarn global add gilt
```

...or equivalent should be all you need to get going.

### Copying to Clipboard

If you are using OS X, you'll have to install `reattach-to-user-namespace`
which you can do with homebrew.

This is currently not supported on other OSen.

## Available Commands
`gilt` is in active development and new commands may be added or the
functionality of existing commands may be changed or removed. If gilt is not
able to parse the output of a command, it will simply attempt to pass it
through to the user.

Currently, `gilt` does not page output of passed through commands. This means
that if you want to use your built-in git pager, you're better off just using
`git unsupported-command` rather than using `gilt`.

`gilt` also attempts to guess the base git command that is being used by
git aliases. For example, if you have `[alias] lg = log --color --graph
--abbrev-commit`, `gilt lg` will be able to determine that this is the output of a
`git log` command and parse and treat it as such so it should work similar to
if you had just used `git log` or the same as `git log --color --graph
--abrev-commit`.

_*Note:* due to the complexity and variability of git aliases, the intended
command may not be properly determined by `gilt`. In this case, it will just
pass the output through_.

### `log`
`gilt log` will parse output to find commit hashes and allow you to scroll
through these hashes and interact with them using the following key commands:

* <kbd>j</kbd>, <kbd>down</kbd> - select next hash.
* <kbd>k</kbd>, <kbd>up</kbd> - select previous hash.
* <kbd>enter</kbd>, <kbd>d</kbd> - view diff of selected hash.
 * specifically, this runs `git -c core.pager='less -+F' show -w <commit>`.
* <kbd>c</kbd> - checkout the selected hash.
* <kbd>y</kbd> - copy the selected hash to the clipboard.

### `status`
`gilt status` will parse output to find filenames and allow you to scroll
through these files and interact with them using the following key commands:

* <kbd>j</kbd>, <kbd>down</kbd> - select next file.
* <kbd>k</kbd>, <kbd>up</kbd> - select previous file.
* <kbd>enter</kbd>, <kbd>e</kbd> - runs `$EDITOR <selected-file>`.
* <kbd>y</kbd> - copy the selected filename to the clipboard.[

*Note:* You must set your `$EDITOR` environment variable to use the editor
functionality.

*Note:* Due to the wide variety of ways that `git status` can be used to
format output as well as the seemingly infinite number of ways filenames can
be specified, it's very easy for `gilt` to recieve some false positives or
miss some actual filenames in the output. It should do a decent job of getting
filenames for `gilt status` or `gilt status -s`.

## Known Issues
* Pass through commands are not paged.
* The mouse doesn't interact with `gilt` command output at all.
* The user's pager is not used for git output from within gilt. Instead,
 `less -+F` is used because if the output were less than one page the process
 would exit immediately and return to `gilt` without displaying anything.
* Copying to clipboard requires `reattach-to-user-namespace` on OS X and is not
 supported on any other OS.

## Upcoming Additions

* [ ] Search + highlight and select functionality
 * [ ] for `log`
 * [ ] for `status`
* [ ] Add parsing of sub-blocks such as authors, branch names, and more.
 * [ ] for `log`
 * [ ] for `status`
* [ ] Add ability to select more than one block
 * [ ] toggle
 * [ ] shift
* [ ] Add more commands
* [ ] Automated testing of some kind
* [ ] Mouse interactions
* [ ] Page pass through output
* [ ] Retain original `git` output
* [ ] Use user defined pager for `diff` of `git log`.

## Development
To get set up for development, simply clone the repo and `yarn install` and
you should be good to go.

`yarn prepublish` will create the output command in `lib/index.js` which you
can run as an executable.

I recommend running `yarn link` to link the repository for local development
which should allow you use `gilt` on the command line. Then run `npx tsc-watch`
and any changes you make to the source should update `gilt`.

### Adding Custom Parsers
If you're not satisfied with an existing parser or you want to add a new parser
for yourself, you can write your own command using gilt.

For an example of how parsers are built, please see the existing parsers
* [src/command/log.ts](./src/command/log.ts)
* [src/command/status.ts](./src/command/status.ts)

```node
#!/usr/bin/env node
// better-gilt

// implement parser for git lg

import { run } from 'gilt';
import { LgParser } from './better-gilt/lg-parser.ts';
const fullCommand = process.argv.slice(2);

if ('lg' === fullCommand[0]) {
  new LgParser().run(fullCommand);
} else {
  // fall back to `gilt`'s normal behavior for other commands.
  run();
}
```

Custom parsers should extend the base class [`Command`](./src/command/Command.ts)
and implement the abstract method `parseData`. This should return an array of
"data blocks" which are representations of the key list elements of the output
of the command -- for example, commit hashes and filenames. See [`Block`](./src/command/Command.ts)
for the interface. A block has a `block` property which is a string of the
acutual element (the hash or filename) and an `offset` which is its position
in output used by navigation.

Next you should also implement `run` and call `super.run()` to set up the
default command behavior as well as your custom key / mouse events or other
special handling.
