---
id: cmd-remove-libclass
title: Remove libclass subcommand
sidebar_label: deux remove libclass
---

> This subcommand is part of [`deux remove`](cmd-remove.html) command.

Remove PHP class config and files generated by [`deux add libclass`](cmd-add-libclass.html).

## Usage
```bash
deux remove libclass [options]
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
  // List of PHP class name in slug.
  // @type Array
  // @required
  "lib": ["example-class"]
}
```

## CLI Example
```bash
# Default
deux remove libclass

# API Mode
deux remove libclass --api --input '{ "lib": ["example-class"] }'
```