---
id: cmd-add-plugin
title: Add plugin subcommand
sidebar_label: deux add plugin
---

> This sub-command is part of [`deux add`](cmd-add.html) command.

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
```javascript 
// JSON Example
{
}
```

## CLI Example
```bash
# Default
deux add plugin

# API Mode
deux add plugin --api --input ''
```
