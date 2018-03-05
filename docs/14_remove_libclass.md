---
id: cmd-remove-libclass
title: Remove libclass subcommand
sidebar_label: deux remove libclass
---

> This subcommand is part of [`deux remove`](cmd-remove.html) command.

## Usage
```bash
deux remove libclass [options]
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
deux remove libclass

# API Mode
deux remove libclass --api --input ''
```
