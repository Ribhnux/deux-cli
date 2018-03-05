---
id: cmd-remove-menu
title: Remove menu subcommand
sidebar_label: deux remove menu
---

> This subcommand is part of [`deux remove`](cmd-remove.html) command.

## Usage
```bash
deux remove menu [options]
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
deux remove menu

# API Mode
deux remove menu --api --input ''
```
