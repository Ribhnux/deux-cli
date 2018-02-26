---
id: cmd-remove-widget
title: Remove widget subcommand
sidebar_label: deux remove widget
---

> This sub-command is part of [`deux remove`](cmd-remove.html) command.

## Usage
```bash
deux remove widget [options]
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
deux remove widget

# API Mode
deux remove widget --api --input ''
```
