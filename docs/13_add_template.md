---
id: cmd-add-template
title: Add template subcommand
sidebar_label: deux add template
---

> This sub-command is part of [`deux add`](cmd-add.html) command.

Add [Post/Page Template](https://developer.wordpress.org/themes/template-files-section/page-template-files/) and Partial Template.

Template files will be created under `page-templates` and `partial-templates` directory. If template type is `partial` it will placed under subdirectory that given by input.

Partial template subdirectory doesn't have nested directory.

## Usage
```bash
deux add template [options]
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
// JSON example for page template.
{
  // @type Object
  // @required
  "template": {
    // @type String
    // @required
    "type": "page",

    // Template post type.
    // @see https://make.wordpress.org/core/2016/11/03/post-type-templates-in-4-7/
    // @type String
    // @required
    "posttype": "post, page, other_post_type",

    // Page template name.
    // @type String
    // @required
    "name": "Full Width",

    // Page template description.
    // @type String
    // @required
    "description": "Example Description"
  }
}

// JSON Example for partial template.
{
  // @type Object
  // @required
  "template": {
    // @type String
    // @required
    "type": "partial",

    // Template directory.
    // @type String
    // @required
    "dir": "header",

    // Template name.
    // @type String
    // @required
    "name": "Topbar",

    // Template description.
    // @type String.
    // @required
    "description": "Example Description"
  }
}
```

## CLI Example
```bash
# Default
deux add template

# API Mode
deux add template --api --input '{ "template": { "type": "page", "posttype": "post, page, other_post_type", "name": "Full Width", "description": "Example Description" } }'
```
