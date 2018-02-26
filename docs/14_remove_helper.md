---
id: cmd-remove-helper
title: Remove helper subcommand
sidebar_label: deux remove helper
---

> This sub-command is part of [`deux remove`](cmd-remove.html) command.

## Usage
```bash
deux remove helper [options]
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
deux remove helper

# API Mode
deux remove helper --api --input ''
```
