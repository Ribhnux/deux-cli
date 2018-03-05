---
id: cmd-add-libclass
title: Add libclass subcommand
sidebar_label: deux add libclass
---

> This subcommand is part of [`deux add`](cmd-add.html) command.

## Usage
```bash
deux add libclass [options]
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
deux add libclass

# API Mode
deux add libclass --api --input ''
```
