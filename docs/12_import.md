---
id: cmd-import
title: Import Theme
sidebar_label: deux import
---

Import theme built with `Deux-CLI`.

## Usage
```bash
deux import <source> [options]
```

## Options
`<source>` *Required*  
Import source, directory or repository URL.

`--db <path>` *Optional*  
Custom database path.

`--input <json>` *Optional*  
Set config in api mode without prompts.

`--api` *Optional*  
Run in API Mode.

### JSON Input
#### Source: Git Repository
```javascript
// JSON Example.
{
  // @type Object
  // @required
  "git": {
    // @type Object
    // @required
    "source": {
      // Repository source username credential
      // @type String
      // @required
      "username": "username",

      // Repository source password credential
      // @type String
      // @required
      "password": "myPassword"
    }

    // New repository URL, could be the same with source.
    // @type String
    // @required
    "url": "https://github.com/username/my-theme.git",

    // Username credential, required if `git.url` is not the same url with source
    // @type String
    // @optional
    "username": "username",

    // Password credential, required if `git.url` is not the same url with source
    // @type String
    // @optional
    "password": "myPassword"
  },

  "overwrite": true
}
```

#### Source: Local directory
```javascript
// JSON Example.
{
  // @type Object
  // @required
  "git": {
    "url": "https://github.com/username/my-theme.git",

    // Username credential
    // @type String
    // @required
    "username": "username",

    // Password credential
    // @type String
    // @required
    "password": "myPassword"
  },

  "overwrite": true
}
```

### CLI Example
```bash
# Default
deux import /var/www/wordpress/wp-content/themes/my-theme
deux import https://github.com/username/my-theme.git

# API Mode
deux import /var/www/wordpress/wp-content/themes/my-theme --api --input '{ "git": { "url": "https://github.com/username/my-theme.git", "username": "username", "password": "myPassword" }, "overwrite": true } '
```
