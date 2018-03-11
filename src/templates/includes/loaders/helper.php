<?php
/**
 * {{theme.name}} helper loader
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

foreach ( ${{theme.slugfn}}_config['helpers'] as $helper ) {
	$helper_path = {{#if theme.parent}}get_template_directory(){{else}}get_stylesheet_directory(){{/if}} . '/includes/helpers/' . $helper . '.php';
	if ( file_exists( $helper_path ) ) {
		require $helper_path;
	}
}
