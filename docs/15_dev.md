---
id: cmd-dev
title: Development Mode
sidebar_label: deux dev
---

Run in development mode, use proxy via [BrowserSync](https://browsersync.io/). Any changes from all javascript and sass codes in `assets-src` and `includes/customizer/assets-src` directory will be compiled to `assets` and `includes/customizer/assets`.

Any changes from PHP codes that contains translation function, will be generated as `pot` file in `languages` directory.

## Usage
```bash
deux dev [options]
```

## Options
`--db <path>` *Optional*  
Custom database path.

`--api` *Optional*  
Run in API Mode.

`--build` *Optional*  
Build all assets.

## CLI Example
```bash
# Default
deux dev

# API Mode
deux dev --build --api
```
