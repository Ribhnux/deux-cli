---
id: cmd-release
title: Release Theme
sidebar_label: deux release
---

Release theme to repository, validate theme and add change logs.

## Usage
```bash
deux release [options]
```

## Options
`--db <path>` *Optional*  
Custom database path.

`--with-src` *Optional*  
Copy compiled zip in releases folder.

## CLI Example
```bash
# Default
deux release

# Copy theme.zip to releases folder
deux release --with-src
```
