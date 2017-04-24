<?php
/**
 * {{themeName}} components loader
 *
 * @package {{themeName}}
 */

foreach ( $deux_config['components'] as $component ) {
	$component_path = get_template_directory() . '/components/' . $component . '.php';
	if ( file_exists( $component_path )) {
		require $component_path;
	}
}
