---
id: basic-cli
title: Basic Command
sidebar_label: Basic Command
---

> The basic command-line of `Deux-CLI` is `deux` not `deux-cli`.

Congratulations, you've installed `Deux-CLI` on your computer.  
Now let's type:
```bash
deux
```

Well, you can't do much with `deux`, terminal will print a notice:
```bash
deux > type deux --help to see available commands.
```

Okay, let's type:
```bash
deux --help
```

Your terminal will print all available commands and basic usage:
```bash
deux 1.0.0 - A Simple WordPress Starter Theme Scaffolding Tools

  USAGE

    deux [command] [subcmd]

  ARGUMENTS

    [command]      See available commands. optional
    [subcmd]       Subcommand if available. type deux [command] --help for more information. optional

  OPTIONS

    --db <path>         Custom database path.                        optional
    --input <json>      Set config in API mode without prompts.      optional
    --api               Run in API Mode.                             optional

  COMMANDS

    new                  Create new theme
    add [subcmd]         Add theme functionality
    remove [subcmd]      Remove theme functionality
    dev                  Run in development mode
    test [subcmd]        Validates js, sass, coding standard and markup before releasing theme
    release              Release theme.
    upgrade              Upgrade assets from CDN and plugin dependencies
    switch [subcmd]       Switch to another theme
    status               Display current theme status
    sync                 Synchronize your theme config to deux database
    help <command>       Display help for a specific command

   GLOBAL OPTIONS

    -h, --help         Display help
    -V, --version      Display version
    --no-color         Disable colors
    --quiet            Quiet mode - only displays warn and error messages
    -v, --verbose      Verbose mode - will also output debug messages
```

Okay, great, don't be hurry, let's follow this tutorial little bit. In the next tutorial you'll initializing `Deux-CLI` database.
