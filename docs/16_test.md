---
id: cmd-test
title: Test and Validate Theme
sidebar_label: deux test
---

Theme built with `Deux-CLI` should be easy to read by user or developer, all codes should be applying coding standards and best practices.

## Usage
```bash
deux test [subcmd] [options]
```

## Subcommands
#### `js`
Test and validate ESLint (Javascript Styleguide) source under `assets-src/js` and `includes/customizer/assets-src/js` directory.

#### `sass`
Test and validate SASS source under `assets-src/sass` and `includes/customizer/assets-src/sass` directory.

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

