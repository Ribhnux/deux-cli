<?php
/**
 * {{theme.name}} helper loader
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

foreach ( ${{theme.slugfn}}_config['helpers'] as $helper ) {
	$helper_path = get_template_directory() . '/includes/helpers/' . $helper . '.php';
	if ( file_exists( $helper_path ) ) {
		require $helper_path;
	}
}
