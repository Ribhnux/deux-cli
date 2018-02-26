---
id: cmd-remove-hooks
title: Remove hooks subcommand
sidebar_label: deux remove hooks
---

> This sub-command is part of [`deux remove`](cmd-remove.html) command.

## Usage
```bash
deux remove hooks [options]
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
deux remove hooks

# API Mode
deux remove hooks --api --input ''
```
