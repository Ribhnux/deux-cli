---
id: cmd-add-component
title: Add component subcommand
sidebar_label: deux add component
---

> This subcommand is part of [`deux add`](cmd-add.html) command.

Add a component template. The difference between component and partial template is, we can pass arguments to it.

It's basically is a function. For an example button, button can have a parameter that can change it's class from primary to secondary.

Template file will be created under `components` directory.

## Usage
```bash
deux add component [options]
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
  "component": {
    // Component Name.
    // @type String
    // @required
    "name": "Button",

    // Component Description.
    // @type String
    // @required
    "description": "Example Description"
  }
}
```

## CLI Example
```bash
# Default
deux add component

# API Mode
deux add component --api --input '{ "component": { "name": "Button", "description": "Example Description" } }'
```
