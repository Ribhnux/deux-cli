
<div align="center">
  <br/>
  <img src="./docs/logo.png" width="300" />
  <br/>
  <br/>
  <p>
    Simple CLI for scaffolding component-based WordPress theme
  </p>
  <p>
    :computer: <a href="#computer-install"> <strong>Install</strong></a> &middot; 
    :rocket: <a href="#rocket-quick-start"><strong>Quick Start</strong></a> &middot; 
    :blue_book: <a href="#blue_book-documentation"><strong>Documentation</strong></a>
  </p>
  <p><br /></p>
  <p>
    <a href="http://travis-ci.org/Ribhnux/deux-cli">
      <img src="https://img.shields.io/travis/Ribhnux/deux-cli/master.svg"/>
    </a>
    <a href="https://gitter.im/Ribhnux/deux-cli">
      <img src="https://img.shields.io/npm/dm/deux-cli.svg?maxAge=2592000"/>
    </a>
    <a href="http://badge.fury.io/js/deux-cli">
      <img src="https://badge.fury.io/js/deux-cli.svg"/>
    </a>
    <a href="http://isitmaintained.com/project/Ribhnux/deux-cli">
      <img src="http://isitmaintained.com/badge/open/Ribhnux/deux-cli.svg"/>
    </a>
    <a href="http://isitmaintained.com/project/Ribhnux/deux-cli">
      <img src="http://isitmaintained.com/badge/resolution/Ribhnux/deux-cli.svg"/>
    </a>
  </p>
  <p><br /></p>
  <p><br /></p>
</div>

## :computer: Install
Prerequisite for PHP developers who's never play with other programming languages and version control:

* Node.js - [Download Latest Version](https://nodejs.org)
* GIT - [Download Latest Version](https://git-scm.com/downloads)

After Node.js and git already installed on your computer.  
Run this command in your terminal:

```bash
$ npm install deux-cli -g
```

## :rocket: Quick Start
Okay, now you have `deux-cli` installed. Let's open terminal and type `deux` to see command list.

Try to type `deux new`, if you're not in WordPress directory you'll see an error message.

If you're in WordPress directory, deux will ask to init and setup project.

Type `deux new` again, to create a new project / theme.

Congrats, you've created new theme.

Suddently you decide that your WordPress theme is a shopping blog, let's add [WooCommerce](https://woocommerce.com/) to your theme as required plugin. Just type `deux add plugin`.

May be you need [Twitter Bootstrap](https://v4-alpha.getbootstrap.com/) as your css framework too, sometimes people lazy to build a beautiful layout from scratch. Type `deux add asset` to do that.

Wow it's awesome.

Now start [Development Mode](#development-mode), type `deux dev`.


## :blue_book: Documentation
After see how `deux-cli` works, you need to shape your skill using this tool. Please read full documentation in [wiki page](https://github.com/Ribhnux/deux-cli/wiki).

## :beers: Contributing
Read full [contributing guide](CONTRIBUTING.md) to learn about development process, how to submit bugfixes and improvements, and how to build and test your changes to this repo.

## License
MIT © [Ribhnux](https://github.com/Ribhnux)
