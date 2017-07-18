<?php
/**
 * {{theme.name}} class loader
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

foreach ( ${{theme.slugfn}}_config['libraries'] as $library ) {
	$libpath = get_template_directory() . '/libraries/' . $library . '.php';
	if ( file_exists( $libpath ) ) {
		require_once $libpath;
	}
}

