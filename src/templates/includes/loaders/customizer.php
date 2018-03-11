<?php
/**
 * {{theme.name}} customizer loader
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

// Register custom control types.
if ( isset( ${{theme.slugfn}}_config['customizer']['control_types'] ) ) {
	foreach ( ${{theme.slugfn}}_config['customizer']['control_types'] as $name => $control ) {
		$customizer_control_path = {{#if theme.parent}}get_stylesheet_directory(){{else}}get_template_directory(){{/if}} . '/includes/customizer/controls/class-wp-customize-' . $name . '-control.php';

		if ( file_exists( $customizer_control_path ) ) {
			require $customizer_control_path;
		}
	}
}

if ( ! function_exists( '{{theme.slugfn}}_customize_register' ) ) :
	/**
	 * Register customizer and setup from config.
	 *
	 * @param object $wp_customize WP Customizer Objects.
	 * @return void
	 */
	function {{theme.slugfn}}_customize_register( $wp_customize ) {
		global ${{theme.slugfn}}_config;

		// Setup customizer UIs.
		foreach ( ${{theme.slugfn}}_config['customizer'] as $type => $customizer ) {
			foreach ( $customizer as $id => $args ) {
				if ( 'panels' === $type ) {
					$wp_customize->add_panel( $id, $args );
				} elseif ( 'sections' === $type ) {
					$wp_customize->add_section( $id, $args );
				} elseif ( 'settings' === $type ) {
					$wp_customize->add_setting( $id, wp_parse_args( $args, array(
						'sanitize_callback' => false,
					) ) );
				} elseif ( 'controls' === $type ) {
					switch ( $args['type'] ) {
						case 'color-picker':
							unset( $args['type'] );
							$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, $id, $args ) );
							break;

						case 'uploader':
							unset( $args['type'] );
							$wp_customize->add_control( new WP_Customize_Upload_Control( $wp_customize, $id, $args ) );
							break;

						case 'image-picker':
							unset( $args['type'] );
							$wp_customize->add_control( new WP_Customize_Cropped_Image_Control( $wp_customize, $id, $args ) );
							break;

						case 'media-picker':
							unset( $args['type'] );
							$wp_customize->add_control( new WP_Customize_Media_Control( $wp_customize, $id, $args ) );
							break;

						case 'custom':
							$control_types = ${{theme.slugfn}}_config['customizer']['control_types'];
							$control_name = $args['custom_control'];

							if ( isset( $control_types[ $control_name ] ) ) {
								$class_name = $control_types[ $control_name ];

								if ( class_exists( $class_name ) ) {
									$control = new ReflectionClass( $class_name );

									unset( $args['type'] );
									unset( $args['custom_control'] );

									$new_control = $control->newInstanceArgs( array( $wp_customize, $id, $args ) );
									$wp_customize->add_control( $new_control );
								}
							}
							break;

						default:
							$wp_customize->add_control( $id, $args );
							break;
					}
				}
			}
		}
	}
endif;
add_action( 'customize_register', '{{theme.slugfn}}_customize_register' );

if ( ! function_exists( '{{theme.slugfn}}_preview_init' ) ) :
	/**
	 * Init custom scripts in customizer preview (right-side).
	 * Such as, observing live-preview changes.
	 */
	function {{theme.slugfn}}_preview_init() {
		global ${{theme.slugfn}}_config;

		$theme_info = wp_get_theme();
		$js_dir = '/includes/customizer/assets/js/';
		$customizer_preview = 'customizer-preview.js';

		if ( true === ${{theme.slugfn}}_config['optimize'] ) {
			$customizer_preview = 'customizer-preview.min.js';
		}

		$script_path = get_theme_file_path( $js_dir . $customizer_preview );
		if ( file_exists( $script_path ) ) {
			wp_enqueue_script( '{{theme.slug}}-customize-preview', {{#if theme.parent}}get_stylesheet_directory_uri() . $js_dir . $customizer_preview{{else}}get_theme_file_uri( $js_dir . $customizer_preview ){{/if}}, array( 'customize-preview' ), $theme_info->get( 'Version' ), true );
		}
	}
endif;
add_action( 'customize_preview_init', '{{theme.slugfn}}_preview_init' );

if ( ! function_exists( '{{theme.slugfn}}_customizer_control_scripts' ) ) :
	/**
	 * Load custom scripts in customizer controls area.
	 */
	function {{theme.slugfn}}_customizer_control_scripts() {
		global ${{theme.slugfn}}_config;

		$theme_info = wp_get_theme();
		$theme_version = $theme_info->get( 'Version' );
		$css_dir = '/includes/customizer/assets/css/';
		$js_dir = '/includes/customizer/assets/js/';
		$customizer_css = 'customizer.css';
		$customizer_control_js = 'customizer-control.js';

		if ( true === ${{theme.slugfn}}_config['optimize'] ) {
			$customizer_css = 'customizer.min.css';
			$customizer_js = 'customizer-control.min.js';
		}

		// Load customizer styles.
		$style_path = get_theme_file_path( $css_dir . $customizer_css );
		if ( file_exists( $style_path ) ) {
			wp_enqueue_style( '{{theme.slug}}-customizer', {{#if theme.parent}}get_stylesheet_directory_uri() . $css_dir . $customizer_css{{else}}get_theme_file_uri( $css_dir . $customizer_css ){{/if}}, array(), $theme_version );
		}

		// Load customizer script.
		$script_path = get_theme_file_path( $js_dir . $customizer_js );
		if ( file_exists( $script_path ) ) {
			wp_enqueue_script( '{{theme.slug}}-customizer-control', {{#if theme.parent}}get_stylesheet_directory_uri() . $js_dir . $customizer_js{{else}}get_theme_file_uri( $js_dir . $customizer_js ){{/if}}, array( 'jquery' ), $theme_version, true );
		}
	}
endif;
add_action( 'customize_controls_enqueue_scripts', '{{theme.slugfn}}_customizer_control_scripts' );
