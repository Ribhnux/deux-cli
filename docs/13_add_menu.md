---
id: cmd-add-menu
title: Add menu subcommand
sidebar_label: deux add menu
---

> This sub-command is part of [`deux add`](cmd-add.html) command.

Add and Register WordPress [Navigation Menu](https://developer.wordpress.org/themes/functionality/navigation-menus/). If menu use custom walker, there will `class-menuname-nav-walker.php` created in `libraries` directory.

## Usage
```bash
deux add menu
```

## JSON Input
```javascript 
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
deux menu --api --input '{ "menu": { "name": "Primary", "description": "Example Description", "walker": true } }'
```
