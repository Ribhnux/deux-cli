---
id: cmd-test
title: Check Theme Linter and Standards
sidebar_label: deux test
---

## Usage
```bash
deux test [subcmd] [options]
```

## Subcommands
#### `js`
Test and validate ESLint (Javascript Styleguide) source under `assets-src/js` and `inc/customizer/assets-src/js` directory.

#### `sass`
Test and validate SASS source under `assets-src/sass` and `inc/customizer/assets-src/sass` directory.

#### `wpcs`
Test and validate [WordPress Coding Standards](https://make.wordpress.org/core/handbook/best-practices/coding-standards/php/).

#### `themecheck`
Test and validate [Theme Check](https://wordpress.org/plugins/theme-check) and [Theme Mentor](https://github.com/Ataurr/Theme-Mentor-For-Themeforest).

#### `w3`
Test and validate [HTML5 Markup](https://validator.w3.org/) output.

## Options
`--db <path>` *Optional*  
Custom database path.

`--api` *Optional*  
Run in API Mode.

## CLI Example
```bash
# Default
deux test
deux test wpcs

# API Mode
deux test js --api
deux test sass --api
```

