<?php
/**
 * {{theme.name}} hooks loader
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

foreach ( ${{theme.slugfn}}_config['filters'] as $filter_name ) {
	$filter_path = {{#if theme.parent}}get_stylesheet_directory(){{else}}get_template_directory(){{/if}} . '/includes/filters/' . $filter_name . '.php';
	if ( file_exists( $filter_path ) ) {
		require $filter_path;
	}
}

foreach ( ${{theme.slugfn}}_config['actions'] as $action_name ) {
	$action_path = {{#if theme.parent}}get_stylesheet_directory(){{else}}get_template_directory(){{/if}} . '/includes/actions/' . $action_name . '.php';
	if ( file_exists( $action_path ) ) {
		require $action_path;
	}
}
