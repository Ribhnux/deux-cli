---
id: cmd-add-feature
title: Add feature subcommand
sidebar_label: deux add feature
---

> This sub-command is part of [`deux add`](cmd-add.html) command.

## Usage
```bash
deux add feature [options]
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
deux add feature

# API Mode
deux add feature --api --input ''
```
