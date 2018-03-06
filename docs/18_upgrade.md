---
id: cmd-upgrade
title: Upgrade Dependencies
sidebar_label: deux upgrade
---

Upgrade asset and plugin dependencies if source has newer version.

## Usage
```bash
deux upgrade [options]
```

## Options
`--db <path>` *Optional*  
Custom database path.

`--list` *Optional*  
Print upgradable list.

`--input <json>` *Optional*  
Set config in api mode without prompts.

`--api` *Optional*  
Run in API Mode.

## JSON Input
```javascript 
// JSON Example
{
  // @type array
  // @required
  "items": [
    {
      "slug": "woocommerce",
      "name":"Woocommerce",
      "version":"3.3.2",
      "type":"plugin",
      "latestVersion":"3.3.3"
    }
  ]
}
```

## CLI Example
```bash
# Default
deux upgrade

# See upgradable list
deux upgrade --list

# API Mode
deux upgrade --api --input '{ "items": [ { "slug": "woocommerce", "name":"Woocommerce", "version":"3.3.2", "type":"plugin", "latestVersion":"3.3.3" } ] }'
```

