---
id: cmd-remove-widget
title: Remove widget subcommand
sidebar_label: deux remove widget
---

> This subcommand is part of [`deux remove`](cmd-remove.html) command.

Remove widget config generated by [`deux add widget`](cmd-add-widget.html).

## Usage
```bash
deux remove widget [options]
```

## Options
`--db <path>` *Optional*  
Custom database path.

`--input <json>` *Optional*  
Set config in api mode without prompts.

`--api` *Optional*  
Run in API Mode.

## JSON Input
```javascript 
// JSON Example
{
  // List of widget slugs.
  // @type Array
  // @required
  "widgets": ["new-widget"]
}
```

## CLI Example
```bash
# Default
deux remove widget

# API Mode
deux remove widget --api --input '{ "widgets": ["new-widget"] }'
```