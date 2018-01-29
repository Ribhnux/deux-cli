---
id: init
title: Initialize Config
sidebar_label: Initialize Config
---

`Deux-CLI` is actually a WordPress starter theme, the first thing you do with starter theme is create a WordPress theme.

Let's type `deux new` to create new theme, you'll got error message because `Deux-CLI` hasn't been initialized before:
```bash
$ deux new

deux > .deuxproject File not exists.
```

## Prerequisite check
When initializing, `Deux-CLI` will check all prerequisite whether it's already installed or not. If you've installed all [Prerequisite](index.html#prerequisites), you'll pass this step.

## Setup Config
After prerequisite check, you'll got prompts and you need to answer it.

### Where is your WordPress installation directory?
Your answer should be your WordPress installation path where `wp-config.php` is in that directory.  
e.g `/var/www/wordpress/`

### What is your local WordPress development URL?
Your answer should be your complete localhost development URL for wordpress.  
e.g `http://localhost:8888/wp/`

### Is your project need Web Fonts?
If you answer `Y` or `y`, you'll need to enter Google Fonts API Key (you can find it at [Google Console Credentials](https://console.cloud.google.com/apis/credentials?project=PROJECT_NAME))

After you done answering all those questions, your terminal will print:

```bash
deux > You have 0 themes in project.
deux > Please create new theme, type: deux new
```

Type `deux new` again, to create new theme.

## Database Path
All `Deux-CLI` infos and theme config are saved on a `JSON` store and can be found on path below:

OS X
```bash
/Users/user/Library/Preferences/.deuxproject
```

Linux
```bash
/home/user/.deuxproject
```

Windows 7-10
```bash
C:\Users\User\AppData\Roaming\.deuxproject
```

Windows XP
```bash
C:\Documents and Settings\User\Application Data\.deuxproject
```
