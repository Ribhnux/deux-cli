---
id: cmd-add-asset
title: Add asset subcommand
sidebar_label: deux add asset
---

> This sub-command is part of [`deux add`](cmd-add.html) command.

`add asset` sub-command will add or download asset resources for theme. Assets can be found under `assets-src` directory (except webfont) that only exists in development. The `assets-src` directory will be removed, after theme released.

There will be 3 different asset types:
- [3rd-party Libraries or Vendors](#3rd-party-libraries-or-vendors).
- [SASS File](#sass-file).
- [Google Web Font](#google-web-font).

## Usage
```bash
deux add asset [options]
```

## Options
`--db <path>` *Optional*  
Custom database path.

`--input <json>` *Optional*  
Set config in api mode without prompts.

`--api` *Optional*  
Run in API Mode.

### 3rd-party Libraries or Vendors
This asset type is bascially will add or download CSS or Javascript from 3rd-party libraries or vendors. We are using [cdnjs.com](https://cdnjs.com/)'s API and [Included Scripts by WordPress](https://developer.wordpress.org/reference/functions/wp_enqueue_script/#default-scripts-included-and-registered-by-wordpress) as source, but you can add your own custom URL as 3rd-party source.

Source type CDN or URL source will also add sass file under `vendors` directory.

#### JSON Input
```javascript
// JSON Example for asset library from cdnjs.com
{
  // @type Object
  // @required
  "asset": {
    // @type String
    // @required
    "type": "lib"
  },

  // @type Object
  // @required
  "lib": {
    // @type String
    // @required
    "source": "cdn",

    // Name handle is from cdnjs.com API slug.
    // For example: https://cdnjs.com/libraries/twitter-bootstrap
    // @type Object
    // @required
    "name": {
      // @type String
      // @required
      "handle": "twitter-bootstrap"
    },

    // Select available version.
    // @type String
    // @required
    "version": "4.0.0-beta.2",

    // Files selected.
    // @type Array
    // @optoinal
    "files": [
      "css/bootstrap.min.css",
      "js/bootstrap.min.js"
    ],

    // Will be loaded as wp_enqueue_script or wp_enqueue_style dependencies in WordPress Theme.
    // @type String
    // @required
    "deps": "jquery"
  }
}

// JSON Example for asset library from WordPress Included Scripts.
// The handle name is slug from https://developer.wordpress.org/reference/functions/wp_enqueue_script/#default-scripts-included-and-registered-by-wordpress table.
{
  // @type Object
  // @required
  "asset": {
    // @type String
    // @required
    "type": "lib"
  },

  // @type Object
  // @required
  "lib": {
    // @type String
    "source": "wp",

    // @type Object
    // @required
    "name": {
      // @type String
      // @required
      "handle": "jquery"
    },

    // Will be loaded as wp_enqueue_script or wp_enqueue_style dependencies in WordPress Theme.
    // @type Array
    // @optional
    "deps": []
  }
}

// JSON Example for asset library from custom URL.
{
  // @type Object
  // @required
  "asset": {
    // @type String
    // @required
    "type": "lib"
  },

  // @type Object
  // @required
  "lib": {
    // @type String
    // @required
    "source": "url",

    // Asset's Name.
    // @type String
    // @required
    "name": "Hint CSS",

    // Asset's Version.
    // @type String
    // @required
    "version": "2.5.0",

    // URL Source.
    // @type URL
    // @required
    "url": "https://raw.githubusercontent.com/chinchang/hint.css/ee20a62cca41e501de21d28d36eef92b9bf10bed/hint.min.css",

    // Dependencies.
    // @type String
    // @optional
    "deps": ""
  }
}
```

#### CLI Example
```bash
# API Mode
deux add asset --api --input '{ "asset": { "type": "lib" }, "lib": { "source": "cdn", "name": { "handle": "twitter-bootstrap" }, "version": "4.0.0-beta.2", "files": [ "css/bootstrap.min.css", "js/bootstrap.min.js" ], "deps": "jquery" } }'
```

### SASS File
This asset type will add sass file with [7-1 Architecture Pattern](http://sass-guidelin.es/#architecture). The basic directory structure is:

```bash
assets-src
|_ sass
|___ abstracts # all abstracts files are arranged by deux
|___ base (included) # all base files are arranged by deux
|___ components
|___ layouts
|___ pages
|___ themes
|___ vendors
```

All files in arranged directories should not / can't be modified (add / remove file), but you can edit it's content. So `deux add asset` with type sass will only add `component`, `layout`, `page`, `theme` and `vendor` file.

#### JSON Input
```javascript
// JSON Example for sass component.
{
  // @type Object
  // @required
  "asset": {
    // @type String
    // @required
    "type": "sass"
  },

  // @type Object
  // @required
  "sass": {
    // Type can be component | layout | page | theme | vendor.
    // @type String
    // @required
    "type": "component",

    // @type String
    // @required
    "name": "button",

    // @type String
    // @required
    "description": "Description."
  }
}
```
#### CLI Example
```bash
# API Mode
deux add asset --api --input '{ "asset": { "type": "sass" }, "sass": { "type": "component", "name": "button", "description": "Description." } }'
```

### Google Web Font
Documentation WIP.
