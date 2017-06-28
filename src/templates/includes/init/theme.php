<?php
/**
 * {{theme.name}} setup
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

/**
 * Set global content width
 *
 * @link https://developer.wordpress.com/themes/content-width/
 */
if ( ! isset( $content_width ) ) {
	$content_width = 640;
}

/**
 * Sets custom content width for diferrent page templates.
 *
 * @return void
 */
function {{theme.slugfn}}_adjust_content_width() {
	global $content_width;
}
add_action( 'template_redirect', '{{theme.slugfn}}_adjust_content_width' );

if ( ! function_exists( '{{theme.slugfn}}_setup' ) ) :
	/**
	 * Sets up theme defaults and registers support for various WordPress features.
	 *
	 * Note that this function is hooked into the after_setup_theme hook, which
	 * runs before the init hook. The init hook is too late for some features, such
	 * as indicating support for post thumbnails.
	 *
	 * @return void
	 */
	function {{theme.slugfn}}_setup() {
		global ${{theme.slugfn}}_config;

		// Make theme available for translation.
		load_theme_textdomain( '{{theme.slug}}' );

		// Init theme supports.
		foreach ( ${{theme.slugfn}}_config['features'] as $name => $value ) {
			if ( is_bool( $value ) ) {
				add_theme_support( $name );
			}

			if ( is_array( $value ) ) {
				$features = array();
				foreach ( $value as $key => $val ) {
					if ( is_string( $val ) ) {
						$features[] = $val;
					}

					if ( is_array( $val ) ) {
						$features[ $key ] = $val;
					}
				}
				add_theme_support( $name, $features );
			}
		}

		// Native theme support.
		add_theme_support( 'title-tag' );
		add_theme_support( 'customize-selective-refresh-widgets' );

		// Register menus.
		register_nav_menus( ${{theme.slugfn}}_config['menus'] );
	}
endif;

add_action( 'after_setup_theme', '{{theme.slugfn}}_setup' );
