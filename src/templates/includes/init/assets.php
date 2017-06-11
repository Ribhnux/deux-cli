<?php
/**
 * {{theme.name}} assets dependencies loader
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

if ( ! function_exists( '{{theme.slugfn}}_enqueue_scripts' ) ) :
function {{theme.slugfn}}_enqueue_scripts() {
	global ${{theme.slugfn}}_config;

	$assets_path = get_template_directory_uri() . '/assets/';

	// Main stylesheets
	wp_enqueue_style( '{{theme.slug}}', $assets_path . 'css/site.css' );

	// Stylesheets from config
	foreach ( ${{theme.slugfn}}_config['assets']['css'] as $key => $value ) {
		$media = ( isset( $value['media'] ) ) ? $value['media'] : 'all';
		wp_enqueue_style( '{{theme.slug}}-' . $key, $assets_path . 'css/vendors/' . $key . '-' . $value['version'] . '.css', array(), $value['version'], $media );
	}

	// Scripts from config
	foreach ( ${{theme.slugfn}}_config['assets']['js'] as $key => $value ) {
		wp_enqueue_script( '{{theme.slug}}-' . $key, $assets_path . 'js/vendors/' . $key . '-' . $value['version'] . '.js', array(), $value['version'], true );
	}

	// Main script
	wp_enqueue_script( '{{theme.slug}}', $assets_path . 'js/site.js', array(), null, true );
	wp_enqueue_script( '{{theme.slug}}-fallback', $assets_path . 'js/fallback.js', array(), null, true );

	// Enable nested comments reply
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
endif;
add_action( 'wp_enqueue_scripts', '{{theme.slugfn}}_enqueue_scripts' );
