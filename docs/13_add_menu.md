---
id: cmd-add-menu
title: Add menu subcommand
sidebar_label: deux add menu
---

> This sub-command is part of [`deux add`](cmd-add.html) command.

Add and Register WordPress [Navigation Menu](https://developer.wordpress.org/themes/functionality/navigation-menus/). If menu use custom walker, there will `class-menuname-nav-walker.php` created in `libraries` directory.

## Usage
```bash
deux add menu [options]
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
  "menu": {
    // Menu Name.
    // @type String
    // @required
    "name": "Primary",

    // Menu Description.
    // @type String
    // @required
    "description": "Example Description",

    // Use Custom Walker.
    // @type Boolean
    // @required
    "walker": true
  }
}
```

## CLI Example
```bash
# Default
deux add menu

# API Mode
deux add menu --api --input '{ "menu": { "name": "Primary", "description": "Example Description", "walker": true } }'
```
