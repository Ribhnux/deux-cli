---
id: cmd-remove
title:  Remove Functionality
sidebar_label: deux remove
---

Remove WordPress Theme functionality from theme.

## Usage
```bash
deux remove [subcmd] [options]
```

## Subcommands
- [asset](cmd-remove-asset.html)
- [plugin](cmd-remove-plugin.html)
- [menu](cmd-remove-menu.html)
- [widget](cmd-remove-widget.html)
- [feature](cmd-remove-feature.html)
- [template](cmd-remove-template.html)
- [component](cmd-remove-component.html)
- [customizer](cmd-remove-customizer.html)
- [imgsize](cmd-remove-imgsize.html)
- [helper](cmd-remove-helper.html)
- [libclass](cmd-remove-libclass.html)
- [hooks](cmd-remove-hooks.html)

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
deux remove

# API Mode
deux remove asset --api --input ''
```
