---
id: cmd-remove-feature
title: Remove feature subcommand
sidebar_label: deux remove feature
---

> This subcommand is part of [`deux remove`](cmd-remove.html) command.

## Usage
```bash
deux remove feature [options]
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
deux remove feature

# API Mode
deux remove feature --api --input ''
```
