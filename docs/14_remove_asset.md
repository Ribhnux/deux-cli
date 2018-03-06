---
id: cmd-remove-asset
title: Remove widget subcommand
sidebar_label: deux remove asset
---

> This subcommand is part of [`deux remove`](cmd-remove.html) command.

Remove asset config and files.

## Usage
```bash
deux remove asset [options]
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
  // @type Array
  // @required
  "assets": [
    {
      // Available types: `lib`, `sass`, and `font`
      // @type String
      // @required
      "type": "lib",

      // Sass Type, required if type is `sass`.
      // Available type: `components`, `layouts`, `pages`, `themes`, and `vendors`
      // @type String
      // @optional
      "sassType": "component"

      // Slug, filename or identifier.
      // @type String
      // @rquired
      "value": "twitter-bootstrap"
    }
  ]
}
```

## CLI Example
```bash
# Default
deux remove asset

# API Mode
deux remove asset --api --input '{ "assets": [ { "type": "lib", "value": "twitter-bootstrap" } ] }'
```
