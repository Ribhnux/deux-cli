---
id: cmd-new
title: New Theme
sidebar_label: deux new
---

Create new theme with `Deux-CLI` starter template.

## Usage
```bash
deux new [options]
```

## Options
`--db <path>` *Optional*  
Custom database path.

`--input <json>` *Optional*  
Set config in api mode without prompts.

`--api` *Optional*  
Run in API Mode.

### JSON Input
```javascript
// JSON Example.
{
  // @type Object
  // @required
  "theme": {
    // Theme Name.
    // @type String
    // @required
    "name": "Ramen Theme",

    // Theme URI.
    // @type String
    // @required
    "uri": "https://ramen.ribhnux.design",

    // Theme Author Name.
    // @type String
    // @required
    "author": "Ribhnux Design",

    // Theme Author URI, should be different with theme URI.
    // @type String
    // @required
    "authorUri": "https://github.com/RibhnuxDesign",

    // Theme Description.
    // @type String
    // @required
    "description": "Example description",

    // Initial Theme Version.
    // @type String
    // @required
    "version": "1.0.0",

    // Theme Tags, you can see available tags below.
    // @type String
    // @required
    "tags": "full-width-template, blog",

    // Is theme is a parent theme or not. Default is false.
    // @type Boolean
    // @required
    "isChild": false,

    // If your theme is child,
    // You should add parent theme text domain in your theme directory.
    // @type String
    // @optional
    "parent": "twentyseventeen"
  },

  // @type Object
  // @required
  "git": {
    // Git Repository URL.
    // @type String
    // @required
    "url": "https://github.com/RibhnuxDesign/ramen-theme.git",

    // Git Authentication Username.
    // @type String
    // @required
    "username": "user",

    // Git Authentication Password.
    // @type String
    // @required
    "password": "password"
  },

  // Default overwrite option is always true,
  // It will overwrite if existing theme with the same name exists in theme directory.
  // @type Boolean
  // @optional
  "overwrite": true
}
```

### CLI Example
```bash
# Default
deux new

# API Mode
deux new --api --input '{ "theme": { "name": "Deux Theme", "uri": "https://github.com/RibhnuxDesign/ramen-theme", "author": "Ribhnux Design", "authorUri": "https://github.com/RibhnuxDesign", "description": "Example description", "version": "1.0.0", "tags": "full-width-template, blog", "isChild": false }, "git": { "url": "https://github.com/RibhnuxDesign/ramen-theme.git", "username": "user", "password": "password" }, "overwrite": true }'
```

### Available Tags
You can see available tags in [WordPress Tags](https://make.wordpress.org/themes/handbook/review/required/theme-tags/) handbook page.

