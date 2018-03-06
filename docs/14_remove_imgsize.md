---
id: cmd-remove-imgsize
title: Remove imgsize subcommand
sidebar_label: deux remove imgsize
---

> This subcommand is part of [`deux remove`](cmd-remove.html) command.

## Usage
```bash
deux remove imgsize [options]
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
deux remove imgsize

# API Mode
deux remove imgsize --api --input ''
```
