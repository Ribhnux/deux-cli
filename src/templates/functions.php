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
require get_template_directory() . '/includes/init/helpers.php';

// Class libraries.
require get_template_directory() . '/includes/init/libraries.php';

// Theme setup.
require get_template_directory() . '/includes/init/theme.php';

// Widgets init.
require get_template_directory() . '/includes/init/widgets.php';

// Plugin dependencies init.
require get_template_directory() . '/includes/init/plugins.php';

// Actions and Filters init.
require get_template_directory() . '/includes/init/hooks.php';

// Assets (JS, CSS, Fonts) init.
require get_template_directory() . '/includes/init/assets.php';

// Components init.
require get_template_directory() . '/includes/init/components.php';
