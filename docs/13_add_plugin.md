---
id: cmd-add-plugin
title: Add plugin subcommand
sidebar_label: deux add plugin
---

> This subcommand is part of [`deux add`](cmd-add.html) command.

Add plugin dependencies via [TGM Plugin Activation](http://tgmpluginactivation.com/).

## Usage
```bash
deux add plugin [options]
```

## Options
`--db <path>` *Optional*  
Custom database path.

`--input <json>` *Optional*  
Set config in api mode without prompts.

`--api` *Optional*  
Run in API Mode.

## JSON Input
### Add Plugin from WordPress.org Repository
```javascript 
{
  // @type Object
  // @required
  "plugin": {
    // @type String
    // @required
    "srctype": "wp",

    // Plugin data.
    // @required
    "item": {
      // Plugin Name.
      // @type String
      // @required
      "name": "WooCommerce",

      // Plugin Slug.
      // @type String
      // @required
      "slug": "woocommerce",

      // Plugin Description.
      // @type String
      // @required
      "description": "Description",

      // Plugin version that will be added.
      // @type String
      // @required
      "version": "3.2.5",
    }

    // Whether plugin is required in theme or not.
    // @type Boolean
    // @required
    "required": true,

    // Whether plugin is force when activation or not.
    // @type Boolean
    // @required
    "force_activation": false,

    // Whether plugin is force when deactivation or not.
    // @type Boolean
    // @required
    "force_deactivation": false,

    // Whether plugin need custom init or not.
    // @type Boolean
    // @required
    "init": true
  }
}
```

### Add Plugin from Private Host
```javascript
{
  // @type Object
  // @required
  "plugin": {
    // @type String
    // @required
    "srctype": "private",

    // Plugin Name.
    // @type String
    // @required
    "name": "Test",

    // Plugin description
    // @type String
    // @required
    "description": 'Description About Anything',

    // Plugin Source.
    // @type String
    // @required
    "source": "https://downloads.mydomain.com/my-plugin.1.0.0.zip",

    // Plugin Slug.
    // @type String
    // @required
    "slug": "test",

    // Plugin Version.
    // @type String
    // @required
    "version": "1.0.0",

    // Plugin Links or documentation URL.
    // @type String
    // @required
    "external_url": 'https://baba.com',

    // Whether plugin is required in theme or not.
    // @type Boolean
    // @required
    "required": true,

    // Whether plugin is force when activation or not.
    // @type Boolean
    // @required
    "force_activation": false,

    // Whether plugin is force when deactivation or not.
    // @type Boolean
    // @required
    "force_deactivation": false,

    // Whether plugin need custom init or not.
    // @type Boolean
    // @required
    "init": true
  }
}
```

## CLI Example
```bash
# Default
deux add plugin

# API Mode
deux add plugin --api --input ''
```
