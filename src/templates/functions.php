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
require get_template_directory() . '/includes/loaders/helpers.php';

// Class libraries.
require get_template_directory() . '/includes/loaders/libraries.php';

// Theme setup.
require get_template_directory() . '/includes/loaders/theme.php';

// Widgets init.
require get_template_directory() . '/includes/loaders/widgets.php';

// Plugin dependencies init.
require get_template_directory() . '/includes/loaders/plugins.php';

// Actions and Filters init.
require get_template_directory() . '/includes/loaders/hooks.php';

// Assets (JS, CSS, Fonts) init.
require get_template_directory() . '/includes/loaders/assets.php';

// Components init.
require get_template_directory() . '/includes/loaders/components.php';
