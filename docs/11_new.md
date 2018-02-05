---
id: cmd-new
title: New Theme
sidebar_label: deux new
---

Create new theme with starter theme.

## Usage
```bash
deux new
```

## CLI Options

`--db <path>` *Optional*  
Custom database path.

`--input <json>` *Optional*  
Set config in api mode without prompts.

`--api` *Optional*  
Run in API Mode.

### JSON Input
If `Deux-CLI` is run in api mode, we should set `--input` with JSON string.

```javascript
// JSON Example.
{
  "theme": {
    "name": 'Deux Theme',
    "uri": 'https://github.com/RibhnuxDesign/ramen-theme',
    "author": 'Ribhnux Design',
    "authorUri": 'https://github.com/RibhnuxDesign',
    "description": 'Example description',
    "version": '1.0.0',
    "tags": 'full-width-template, blog',
    "parent": false,
  },
  "git": {
    "url": 'https://github.com/RibhnuxDesign/ramen-theme.git',
    "username": 'user',
    "password": 'password'
  },
  "overwrite": true
}
```

### CLI Example
```bash
# Default
deux new

# API Mode
deux new --api --input '{ "theme": { "name": "Deux Theme", "uri": "https://github.com/RibhnuxDesign/ramen-theme", "author": "Ribhnux Design", "authorUri": "https://github.com/RibhnuxDesign", "description": "Example description", "version": "1.0.0", "tags": "full-width-template, blog" }, "git": { "url": "https://github.com/RibhnuxDesign/ramen-theme.git", "username": "user", "password": "password" }, "overwrite": true }'
```

### Available Tags
You can see available tags in [WordPress Tags](https://make.wordpress.org/themes/handbook/review/required/theme-tags/) handbook page.

