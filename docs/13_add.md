---
id: cmd-add
title: Add Functionality
sidebar_label: deux add
---

Add WordPress Theme functionality such as assets, plugins, menus, widgets, and more.

## Usage
```bash
deux add [subcmd]
```

## CLI Options

`--db <path>` *Optional*  
Custom database path.

`--input <json>` *Optional*  
Set config in api mode without prompts.
, 
`--api` *Optional*  
Run in API Mode.

### Add asset subcommand
Add theme assets (CSS or Javascript, SASS, and Web Fonts). All assets in your theme can be found under `assets-src` directory and only for development mode, when you are releasing theme, `assets-src` directory will be not included.

We are using [cdnjs.com](https://cdnjs.com/)'s API and [Included Scripts by WordPress](https://developer.wordpress.org/reference/functions/wp_enqueue_script/#default-scripts-included-and-registered-by-wordpress) as source, but you can add your own custom URL as 3rd-Party source.

For SASS architecture, we follows [7-1 Architecture Pattern](http://sass-guidelin.es/#architecture).

**JSON Input**
```bash

```

**CLI Example**
```bash
# Default
deux add asset

# API Mode
deux add asset --api --input 'JSON_INPUT'
```
