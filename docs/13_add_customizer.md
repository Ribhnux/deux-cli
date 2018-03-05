---
id: cmd-add-customizer
title: Add customizer subcommand
sidebar_label: deux add customizer
---


> This subcommand is part of [`deux add`](cmd-add.html) command.

## Usage
```bash
deux add customizer [options]
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
deux add customizer

# API Mode
deux add customizer --api --input ''
```
