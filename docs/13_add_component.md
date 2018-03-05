---
id: cmd-add-component
title: Add component subcommand
sidebar_label: deux add component
---

> This subcommand is part of [`deux add`](cmd-add.html) command.

## Usage
```bash
deux add component [options]
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
deux add component

# API Mode
deux add component --api --input ''
```
