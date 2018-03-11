<?php
/**
 * {{theme.name}} components loader
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

foreach ( ${{theme.slugfn}}_config['components'] as $component ) {
	$component_path = {{#if theme.parent}}get_template_directory(){{else}}get_stylesheet_directory(){{/if}} . '/components/' . $component . '.php';
	if ( file_exists( $component_path ) ) {
		require $component_path;
	}
}
