<?php
/**
 * {{theme.name}} class loader
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

foreach ( ${{theme.slugfn}}_config['libraries'] as $library ) {
	$libpath = {{#if theme.parent}}get_stylesheet_directory(){{else}}get_template_directory(){{/if}} . '/includes/libraries/' . $library . '.php';
	if ( file_exists( $libpath ) ) {
		require_once $libpath;
	}
}

