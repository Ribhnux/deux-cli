<?php
/**
 * {{themeName}} functions and definitions
 *
 * @package {{themeName}}
 */

/**
 * Theme setup.
 */
require get_template_directory() . '/includes/init/theme.php';

/**
 * Init theme features supports.
 */
require get_template_directory() . '/includes/init/theme-features.php';

/**
 * Plugin dependencies init.
 */
require get_template_directory() . '/includes/init/plugins.php';

/**
 * Actions and Filters init.
 */
require get_template_directory() . '/includes/init/hooks.php';

/**
 * Assets (JS, CSS, Fonts) init.
 */
require get_template_directory() . '/includes/init/assets.php';

/**
 * Components init.
 */
require get_template_directory() . '/includes/init/components.php';
