<?php
/**
 * {{theme.name}} functions, hooks, and init
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

// Read theme config.
require {{{ themepath theme "'/" theme.slug "-config.php'" }}};

// Function helpers.
require {{{ themepath theme "'/includes/loaders/helper.php'" }}};

// Class libraries.
require {{{ themepath theme "'/includes/loaders/libclass.php'" }}};

// Theme setup.
require {{{ themepath theme "'/includes/loaders/theme.php'" }}};

// Widgets init.
require {{{ themepath theme "'/includes/loaders/widget.php'" }}};

// Plugin dependencies init.
require {{{ themepath theme "'/includes/loaders/plugin.php'" }}};

// Actions and Filters init.
require {{{ themepath theme "'/includes/loaders/hook.php'" }}};

// Assets (JS, CSS, Fonts) init.
require {{{ themepath theme "'/includes/loaders/asset.php'" }}};

// Components init.
require {{{ themepath theme "'/includes/loaders/component.php'" }}};

// Customizers init.
require {{{ themepath theme "'/includes/loaders/customizer.php'" }}};
