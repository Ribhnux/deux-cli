---
id: cmd-add-customizer
title: Add customizer subcommand
sidebar_label: deux add customizer
---

> This subcommand is part of [`deux add`](cmd-add.html) command.

Add customizer function (panels, sections, custom control types, and settings).

New custom control types will add new file under `includes/customizer/controls` and `includes/customizer/assets-src/controls`.

## Usage
```bash
deux add customizer [options]
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
// JSON Example: Add setting/control to new section
{
  // @type Object
  // @required
  "customizer": {
    // Setting Name.
    // @type Object
    // @required
    "setting": {
      // Setting Name.
      // @type String
      // @required
      "name": "My Input",

      // Control Transport Types.
      // Available options: `refresh` or `postMessage`
      // @type String
      // @required
      "transport": "refresh",

      // Default Setting Value.
      // @type String
      // @required
      "default": ""
    },

    // Control or form field UI for current setting.
    // @type Object
    // @required
    "control": {
      // Control Description.
      // @type String
      // @required
      "description": "My Input Description",

      // Control Type.
      // Available types: `text`, `number`, `checkbox`, `radio`, `select`, `range`, `email`,
      //                  `url`, `dropdown-pages`, `color-picker`, `uploader`, `image-picker`, `media-picker`, `custom`
      // @type String
      // @required
      "type": "text",

      // Section name for this control.
      // Avalable section: `themes`, `title_tagline`, `colors`, `header_image`, `background_image`, `static_front_page`, `custom_css`, `custom`
      // @type String
      // @required
      "section": "custom"
    },

    // Set custom control type, required if `control.type` is `custom`.
    // @type Object
    // @optional
    "customControl": {
      // Custom control name.
      // @type String
      // @required
      "name": "Greeting",

      // Custom control description.
      // @type String
      "description": "Control Description"
    },

    // New section, required if `control.section` is `custom`.
    // @type Object
    // @optional
    "section": {
      // Section title.
      // @type String
      // @required
      "title": "New Section",

      // Section description.
      // @type String
      // @required
      "description": "Section Description",

      // Section order priority.
      // @type Number
      // @required
      "priority": 160,

      // Whether section is inside a panel or not.
      // @type Boolean
      // @required
      "inPanel": true,

      // Panel Type, required if `section.inPanel` is `true`
      // Available types: `nav_menus`, `widget`, and `custom`
      // @type Boolean
      // @optional
      "type": "custom"
    },

    // New panel, required if `section.type` is `custom`.
    // @type Object
    // @optional
    "panel": {
      // Panel title.
      // @type String
      // @required
      "title": "New Panel",

      // Panel description.
      // @type String
      // @required
      "description": "Panel Description",

      // Panel order priority.
      // @type Number
      // @required
      "priority": 160
    }
  }
}
```

## CLI Example
```bash
# Default
deux add customizer

# API Mode
deux add customizer --api --input '"customizer": { "setting": { "name": "My Input", "transport": "refresh", "default": "" }, "control": { "description": "My Input Description", "type": "text", "section": "custom" } } '
```
