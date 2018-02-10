---
id: cmd-add-widget
title: Add widget subcommand
sidebar_label: deux add widget
---

> This sub-command is part of [`deux add`](cmd-add.html) command.

Add and Register WordPress [Widget](https://developer.wordpress.org/themes/functionality/widgets/).

## Usage
```bash
deux add widget
```

## JSON Input
```javascript 
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
deux menu --api --input '{ "widget": { "name": "New Widget", "description": "Example Description" } }'
```
