<?php
/**
 * {{theme.name}} assets dependencies loader
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

if ( ! function_exists( '{{theme.slugfn}}_font_url' ) ) :
	/**
	 * Register Google Fonts
	 *
	 * @return string
	 */
	function {{theme.slugfn}}_font_url() {
		global ${{theme.slugfn}}_config;

		$fonts_url = '';
		$font_families = array();
		$font_subsets = array();

		foreach ( ${{theme.slugfn}}_config['asset']['fonts'] as $font ) {
			$font_families[] = rawurlencode( $font['name'] ) . ':' . implode( ',', $font['variants'] );
			$font_subsets = array_merge( $font_subsets, $font['subsets'] );
		}

		if ( count( $font_families ) > 0 ) {
			$query_args = array(
				'family' => implode( '|', $font_families ),
				'subset' => implode( ',', array_unique( $font_subsets ) ),
			);

			$fonts_url = add_query_arg( $query_args, '//fonts.googleapis.com/css' );

			return esc_url_raw( $fonts_url );
		}
	}
endif;

if ( ! function_exists( '{{theme.slugfn}}_resource_hints' ) ) :
	/**
	 * Add preconnect for Google Fonts.
	 *
	 * @param array  $urls           URLs to print for resource hints.
	 * @param string $relation_type  The relation type the URLs are printed.
	 * @return array $urls           URLs to print for resource hints.
	 */
	function {{theme.slugfn}}_resource_hints( $urls, $relation_type ) {
		if ( wp_style_is( '{{theme.slug}}-fonts', 'queue' ) && 'preconnect' === $relation_type ) {
			$urls[] = array(
				'href' => 'https://fonts.gstatic.com',
				'crossorigin',
			);
		}
		return $urls;
	}
endif;
add_filter( 'wp_resource_hints', '{{theme.slugfn}}_resource_hints', 10, 2 );

if ( ! function_exists( '{{theme.slugfn}}_enqueue_dependencies' ) ) :
	/**
	 * Assets dependencies loader to load fonts, styles, and javascripts.
	 *
	 * @return void
	 */
	function {{theme.slugfn}}_load_dependencies() {
		global ${{theme.slugfn}}_config;

		$assets_path = get_template_directory_uri() . '/assets/vendors/';

		// Load Fonts from google.
		wp_enqueue_style( '{{theme.slug}}-fonts', {{theme.slugfn}}_font_url(), array(), null );

		// Load Stylesheet and Javascript.
		foreach ( ${{theme.slugfn}}_config['asset']['libs'] as $name => $libs ) {
			if ( 'wp' === $libs['source'] ) {
				wp_enqueue_script( $name );
			} else {
				foreach ( $libs['files'] as $file ) {
					if ( ! $file['is_active'] ) {
						continue;
					}

					switch ( $file['ext'] ) {
						case 'css':
							wp_enqueue_style( $name, $assets_path . $name . '/' . $file['path'], $file['deps'], $libs['version'] );
							break;

						case 'js':
							wp_enqueue_script( $name, $assets_path . $name . '/' . $file['path'], $file['deps'], $libs['version'], true );
							break;
					}
				}
			}
		}
	}
endif;

if ( ! function_exists( '{{theme.slugfn}}_enqueue_scripts' ) ) :
	/**
	 * Load all styles and scripts.
	 *
	 * @link https://codex.wordpress.org/Plugin_API/Action_Reference/wp_enqueue_scripts
	 * @return void
	 */
	function {{theme.slugfn}}_enqueue_scripts() {
		global ${{theme.slugfn}}_config;

		$theme_info = wp_get_theme();
		$theme_version = $theme_info->get( 'Version' );
		$css_dir = '/assets/css/';
		$js_dir = '/assets/js/';
		$theme_css = 'theme.css';
		$theme_js = 'theme.js';

		if ( true === ${{theme.slugfn}}_config['optimize'] ) {
			$theme_css = 'theme.min.css';
			$theme_js = 'theme.min.js';
		}

		// Load dependencies.
		{{theme.slugfn}}_load_dependencies();

		// Load theme styles.
		$style_path = get_theme_file_path( $css_dir . $theme_css );
		if ( file_exists( $style_path ) ) {
			wp_enqueue_style( '{{theme.slug}}-style', get_theme_file_uri( $css_dir . $theme_css ), array(), $theme_version );

			// RTL Stylesheets.
			if ( is_rtl() ) {
				wp_style_add_data( '{{theme.slug}}-style', 'rtl', 'replace' );
			}
		}

		// Load theme script.
		$script_path = get_theme_file_path( $js_dir . $theme_js );
		if ( file_exists( $script_path ) ) {
			wp_enqueue_script( '{{theme.slug}}-script', get_theme_file_uri( $js_dir . $theme_js ), array(), $theme_version, true );
		}

		// Enable nested comments reply.
		if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
			wp_enqueue_script( 'comment-reply' );
		}
	}
endif;
add_action( 'wp_enqueue_scripts', '{{theme.slugfn}}_enqueue_scripts' );
