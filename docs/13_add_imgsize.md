---
id: cmd-add-imgsize
title: Add imgsize subcommand
sidebar_label: deux add imgsize
---

> This subcommand is part of [`deux add`](cmd-add.html) command.

Add and register [Custom Image Size](https://developer.wordpress.org/reference/functions/add_image_size/).

## Usage
```bash
deux add imgsize [options]
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
  "imgsize": {
    // Size Name.
    // @type String
    // @required
    "name": "Example Size",

    // Size Width.
    // @type Number
    // @required
    "width": 250,

    // Size Height.
    // @type Number
    // @required
    "height": 250,

    // Is current size use crop feature?
    // @type Boolean
    // @required
    "crop": true,

    // Whether use custom position or not?
    // @type Boolean
    // @optional
    "custompos": true,

    // If `custompos` is true, pos should be set.
    // @type Object
    // @optional
    "pos": {
      // Possible `x` position: `left`, `center`, `right`.
      // @type String
      // @required
      "x": "center",

      // Possible `x` position: `top`, `center`, `bottom`.
      // @type String
      // @required
      "y": "center"
    }
  }
}
```

## CLI Example
```bash
# Default
deux add imgsize

# API Mode
deux add imgsize --api --input ' { "imgsize": { "name": "Example Size", "width": 250, "height": 250, "crop": true, "custompos": true, "pos": { "x": "center", "y": "center" } } }'
```
