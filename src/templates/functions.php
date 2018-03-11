<?php
/**
 * {{theme.name}} functions, hooks, and init
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

// Read theme config.
require get_template_directory() . '/{{theme.slug}}-config.php';

// Function helpers.
require get_template_directory() . '/includes/loaders/helper.php';

// Class libraries.
require get_template_directory() . '/includes/loaders/libclass.php';

// Theme setup.
require get_template_directory() . '/includes/loaders/theme.php';

// Widgets init.
require get_template_directory() . '/includes/loaders/widget.php';

// Plugin dependencies init.
require get_template_directory() . '/includes/loaders/plugin.php';

// Actions and Filters init.
require get_template_directory() . '/includes/loaders/hook.php';

// Assets (JS, CSS, Fonts) init.
require get_template_directory() . '/includes/loaders/asset.php';

// Components init.
require get_template_directory() . '/includes/loaders/component.php';

// Customizers init.
require get_template_directory() . '/includes/loaders/customizer.php';
