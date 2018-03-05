---
id: cmd-add-hooks
title: Add hooks subcommand
sidebar_label: deux add hooks
---

> This subcommand is part of [`deux add`](cmd-add.html) command.

## Usage
```bash
deux add hooks [options]
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
deux add hooks

# API Mode
deux add hooks --api --input ''
```
