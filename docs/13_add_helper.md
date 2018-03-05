---
id: cmd-add-helper
title: Add helper subcommand
sidebar_label: deux add helper
---

> This subcommand is part of [`deux add`](cmd-add.html) command.

Add custom PHP function. All helpers are partial and structured under `includes/helpers` directory.

## Usage
```bash
deux add helper [options]
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
  "helper": {
    // Function Name.
    // @type String
    // @required
    "name": "Example Helper",

    // Function Description.
    // @type String
    // @required
    "description": "Example Description"
  }
}
```

## CLI Example
```bash
# Default
deux add helper

# API Mode
deux add helper --api --input ' { "helper": { "name": "Example Helper", "description": "Example Description" } }'
```
