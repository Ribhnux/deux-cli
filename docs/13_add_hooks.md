---
id: cmd-add-hooks
title: Add hooks subcommand
sidebar_label: deux add hooks
---

> This subcommand is part of [`deux add`](cmd-add.html) command.

Add [WordPress Hooks](https://codex.wordpress.org/Plugin_API/Hooks) (Filter/Action).

## Usage
```bash
deux add hooks [options]
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
  "hooks": {
    // Possible types: `filter` or `action`.
    // @type String
    // @required
    "type": "filter",

    // Function Name.
    // @type String
    // @required
    "name": "Trim Content",

    // Function Description.
    // @type String
    // @required
    "description": "Example Description",

    // Add filter/action to this function.
    // @type String
    // @required
    "fn": "the_content",

    // Hook Priority.
    // @type Number
    // @required
    "priority": 10
  }
}
```

## CLI Example
```bash
# Default
deux add hooks

# API Mode
deux add hooks --api --input ' { "hooks": { "type": "filter", "name": "Trim Content", "description": "Example Description", "fn": "the_content", "priority": 10 } } '
```
