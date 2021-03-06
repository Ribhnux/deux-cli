---
id: cmd-remove-imgsize
title: Remove imgsize subcommand
sidebar_label: deux remove imgsize
---

> This subcommand is part of [`deux remove`](cmd-remove.html) command.

Remove image size config generated by [`deux add imgsize`](cmd-add-imgsize.html).

## Usage
```bash
deux remove imgsize [options]
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
  // List of imgsize slugs.
  // @type Array
  // @required
  "imgsize": ["example-size"]
}
```

## CLI Example
```bash
# Default
deux remove imgsize

# API Mode
deux remove imgsize --api --input '{ imgsize: ["example-size"] }'
```
