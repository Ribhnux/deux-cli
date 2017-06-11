<?php
/**
 * {{theme.name}} assets dependencies loader
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

if ( ! function_exists( '{{theme.slugfn}}_enqueue_dependencies' ) ) :
function {{theme.slugfn}}_load_dependencies() {
	global ${{theme.slugfn}}_config;

	$assets_path = get_template_directory_uri() . '/assets/public/vendors/';

	// Load Fonts
	foreach ( ${{theme.slugfn}}_config[ 'asset' ][ 'fonts' ] as $name => $font ) {
		wp_enqueue_style( $name, $font[ 'url' ], array(), null );
	}

	// Load Stylesheet and Javascript
	foreach ( ${{theme.slugfn}}_config[ 'asset' ][ 'libs' ] as $name => $libs ) {
		if ( $libs[ 'source' ] === 'wordpress' ) {
			wp_enqueue_script( $name );
		} else {
			foreach ( $libs[ 'files' ] as $file ) {
				switch ( $file[ 'ext' ] ) {
					case 'css':
						wp_enqueue_style( $name, $assets_path . $file[ 'path' ], $file[ 'deps' ], $libs[ 'version' ] );
						break;

					case 'js':
						wp_enqueue_script( $name, $assets_path . $file[ 'path' ], $file[ 'deps' ], $libs[ 'version' ], true );
						break;
				}
			}
		}
	}
}
endif;

if ( ! function_exists( '{{theme.slugfn}}_enqueue_scripts' ) ) :
function {{theme.slugfn}}_enqueue_scripts() {
	global ${{theme.slugfn}}_config;

	$assets_path = get_template_directory_uri() . '/assets/public/';
	$style_css = 'style.css';
	$script_js = 'script.js';

	if ( ${{theme.slugfn}}_config[ 'optimize' ] === true ) {
		$style_css = 'style.min.css';
		$script_js = 'script.min.css';
	}

	// Load all dependencies
	{{theme.slugfn}}_load_dependencies();

	// Main stylesheets
	wp_enqueue_style( '{{theme.slug}}', $assets_path . $style_css );

	// Main script
	wp_enqueue_script( '{{theme.slug}}', $assets_path . $script_js, array(), null, true );

	// Enable nested comments reply
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
endif;
add_action( 'wp_enqueue_scripts', '{{theme.slugfn}}_enqueue_scripts' );
