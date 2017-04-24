<?php
/**
 * {{themeName}} functions, hooks, and init
 *
 * @package {{themeName}}
 * @since {{version}}
 */

function {{themeFnPrefix}}_read_config() {
	global $wp_filesystem;

	if ( empty( $wp_filesystem ) ) {
		require_once ABSPATH . '/wp-admin/includes/file.php';
		WP_Filesystem();
	}

	$config = $wp_filesystem->get_contents( get_template_directory() . '/.deuxconfig' );
	$config = json_decode( $config, true );
	return $config;
}

$deux_config = {{themeFnPrefix}}_read_config();

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
