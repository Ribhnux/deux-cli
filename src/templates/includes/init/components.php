<?php
/**
 * {{theme.name}} components loader
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

foreach ( ${{theme.slugfn}}_config['components'] as $component ) {
	$component_path = get_template_directory() . '/components/' . $component . '.php';
	if ( file_exists( $component_path )) {
		require $component_path;
	}
}
