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
		$customizer_control_path = get_template_directory() . '/includes/customizers/controls/' . $name . '/class-wp-customize-' . $name . '-control.php';

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
					$wp_customize->add_setting( $id, $args );
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
							$class_name = ${{theme.slugfn}}_config['customizer']['control_types'][ $args['custom_control'] ];

							if ( $class_name ) {
								$control = new ReflectionClass( $class_name );
	
								unset( $args['type'] );
								unset( $args['custom_control'] );
	
								$new_control = $control->newInstanceArgs( array( $wp_customize, $id, $args ) );
								$wp_customize->add_control( $new_control );
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
		$theme_info = wp_get_theme();
		wp_enqueue_script( '{{theme.slugfn}}-customize-preview', get_theme_file_uri( '/includes/customizers/assets/js/preview.js' ), array( 'customize-preview' ), $theme_info->get( 'Version' ), true );
	}
endif;
add_action( 'customize_preview_init', '{{theme.slugfn}}_preview_init' );

if ( ! function_exists( '{{theme.slugfn}}_customizer_control_scripts' ) ) :
	/**
	 * Load custom scripts in customizer controls area.
	 */
	function {{theme.slugfn}}_customizer_control_scripts() {
		$theme_info = wp_get_theme();
		wp_enqueue_style( '{{theme.slugfn}}-customize-control', get_theme_file_uri( '/includes/customizers/assets/css/customizer.css' ), array(), $theme_info->get( 'Version' ), true );
		wp_enqueue_script( '{{theme.slugfn}}-customize-control', get_theme_file_uri( '/includes/customizers/assets/js/control.js' ), array( 'jquery' ), $theme_info->get( 'Version' ), true );
	}
endif;
add_action( 'customize_controls_enqueue_scripts', '{{theme.slugfn}}_customizer_control_scripts' );
