---
id: cmd-add-feature
title: Add feature subcommand
sidebar_label: deux add feature
---

> This subcommand is part of [`deux add`](cmd-add.html) command.

Add [WordPress Theme Features](https://codex.wordpress.org/Theme_Features). All theme features are basically `add_theme_support` function.

## Usage
```bash
deux add feature [options]
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
  "feature": {
    // Feature type,
    // available types: `html5`, `post-formats`, `post-thumbnails`, `custom-background`, `custom-header`, `custom-logo`, and `woocommerce`
    // @type String
    // @required
    "type": "html5",

    // Post type, only needed when feature type is `post-thumbnails`
    // @type Boolean
    // @optional
    "posttype": false,

    // Feature options. See options below.
    // @type Object|Array
    // @required
    "options": [],

    // Is in advanced mode or not. Only available when type is `custom-background` or `custom-header`
    // @type Boolean
    // @optional
    "advanced": true
  }
}
```
### Example options for `html5`

```javascript
// @type Array
[
  "comment-list",
  "comment-form",
  "search-form",
  "gallery",
  "caption"
]
```

### Example options for `post-formats`
```javascript
// @type Array
[
  "aside"
  "gallery"
  "link"
  "image"
  "quote"
  "status"
  "video"
  "audio"
  "chat"
]
```

### Example options for `post-thumbnails`
Developer can add anything, unless `options` is not empty.

```javascript
// @type Array
[
  "post",
  "book",
  "my-cpt"
]
```

### Example options for `custom-background`.
```javascript
// @type Object
"options": {
  // Image URL.
  // @type String
  // @required
  "imageUrl": "http://imageurl.com/image.jpg",

  // Background Color.
  // @type String
  // @required
  "color": "#fff",

  // Background Presets.
  // Available presets:  `default`, `fill`, `fit`, `repeat`, and `custom`
  // @type String
  // @required
  "preset": "custom",

  // Custom position, required if `preset` is `custom`
  // @type Object
  // @optional
  "position": {
    // Available position: `left`, `center`, and `right`
    // @type String
    // @required
    "x": "center",

    // Available position: `top`, `center`, and `bottom`
    // @type String
    // @required
    "y": "center"
  },

  // Image size type, required if `preset` is `custom`
  // Available size: `cover`, `contain`, and `auto`
  // @type String
  // @optional
  "imageSize": "contain",

  // Whether repeat background image or not, required if `preset` is `custom`
  // @type Boolean
  // @optional
  "repeat": true,

  // Background attachment, required if `preset` is `custom`.
  // Available attachment: `scroll` or `fixed`
  // @type String
  // @optional
  "attachment": "fixed",

  // Whether add custom output in `wp_head` or not, required if `preset` is `custom`.
  // If set as true, a new file `includes/helpers/custom-background.php` will be added
  // @type Boolean
  // @optional
  "wpHeadCallback": true
}
```

### Example options for `custom-header`.
```javascript
// @type Object
"options": {
  // Image URL.
  // @type String
  // @required
  "imageUrl": "http://imageurl.com/image.jpg",

  // Image width.
  // @type Number
  // @required
  "width": 2000,

  // Image height.
  // @type Number
  // @required
  "height": 1200,

  // Whether header is flexible width or not.
  // @type Boolean
  // @required
  "flexWidth": true,

  // Whether header is flexible height or not.
  // @type Boolean
  // @required
  "flexHeight": true,

  // Whether header is randomizable or not.
  // @type Boolean
  // @required
  "random": true,

  // Whether header has text or not.
  // @type Boolean
  // @required
  "headerText": true,

  // Header text color, required if `headerText` is `true`
  // @type String
  // @optional
  "textColor": '#fff',

  // Whether header can upload video or not.
  // @type Boolean
  // @required
  "video": true,

  // Whether video always active or has custom condition, required if `video` is `true`.
  // If set as true, a new file `includes/helpers/ustom-header-video.php` will be added
  // @type Boolean
  // @optional
  "videoAlwaysActive": false,

  // Whether add custom output in `wp_head` or not, required if `preset` is `custom`.
  // If set as true, a new file `includes/helpers/custom-header.php` will be added
  // @type Boolean
  // @optional
  "wpHeadCallback": true
}
```

### Example options for `custom-logo`.
```javascript
// @type Object
{
  // Image width.
  // @type Number
  // @required
  "width": 2000,

  // Image height.
  // @type Number
  // @required
  "height": 1200,

  // Whether logo is flexible width or not.
  // @type Boolean
  // @required
  "flexWidth": true,

  // Whether logo is flexible height or not.
  // @type Boolean
  // @required
  "flexHeight": true
}
```

## CLI Example
```bash
# Default
deux add feature

# API Mode
deux add feature --api --input '{ "feature": { "type": "html5", "options": [ "comment-list", "comment-form", "search-form", "gallery", "caption" ] } }'
```
