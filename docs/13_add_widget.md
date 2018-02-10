---
id: cmd-add-widget
title: Add widget subcommand
sidebar_label: deux add widget
---

> This sub-command is part of [`deux add`](cmd-add.html) command.

Add and Register WordPress [Widget](https://developer.wordpress.org/themes/functionality/widgets/).

## Usage
```bash
deux add widget [options]
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
  // @type Object
  // @required
  "widget": {
    // @type String
    // @required
    "name": "New Widget",

    // @type String
    // @required
    "description": "Example Description"
  }
}
```

## CLI Example
```bash
deux add widget --api --input '{ "widget": { "name": "New Widget", "description": "Example Description" } }'
```
