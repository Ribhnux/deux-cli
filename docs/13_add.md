---
id: cmd-add
title: Add Functionality
sidebar_label: deux add
---

Add WordPress Theme functionality such as assets, plugins, menus, widgets, and more.

## Usage
```bash
deux add [subcmd] [options]
```

## Subcommands
- [asset](cmd-add-asset.html)
- [plugin](cmd-add-plugin.html)
- [menu](cmd-add-menu.html)
- [widget](cmd-add-widget.html)
- [feature](cmd-add-feature.html)
- [template](cmd-add-template.html)
- [component](cmd-add-component.html)
- [customizer](cmd-add-customizer.html)
- [imgsize](cmd-add-imgsize.html)
- [helper](cmd-add-helper.html)
- [libclass](cmd-add-libclass.html)
- [hooks](cmd-add-hooks.html)

## Options

`--db <path>` *Optional*  
Custom database path.

`--input <json>` *Optional*  
Set config in api mode without prompts.

`--api` *Optional*  
Run in API Mode.

### CLI Example
```bash
# Default
deux add

# API Mode
deux add asset --api --input '{ "asset": { "type": "lib" }, "lib": { "source": "cdn", "name": { "handle": "twitter-bootstrap" }, "version": "4.0.0-beta.2", "files": [ "css/bootstrap.min.css", "js/bootstrap.min.js" ], "deps": "jquery" } }'
```
