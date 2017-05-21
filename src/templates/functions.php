<?php
/**
 * {{themeName}} functions, hooks, and init
 *
 * @package {{themeName}}
 * @since {{version}}
 */

require get_template_directory() . '/{{themeFnPrefix}}_config.php';

/**
 * Theme setup.
 */
require get_template_directory() . '/includes/init/theme.php';

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
