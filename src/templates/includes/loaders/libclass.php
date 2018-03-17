<?php
/**
 * {{theme.name}} class loader
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

foreach ( ${{theme.slugfn}}_config['libraries'] as $library ) {
	$libpath = {{{ themepath theme "'/includes/libraries/' . $library . '.php'" }}};
	if ( file_exists( $libpath ) ) {
		require_once $libpath;
	}
}

