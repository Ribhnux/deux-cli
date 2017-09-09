<?php
/**
 * Control Name: {{control.name}}
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

if ( class_exists( 'WP_Customize_Control' ) ) :

	/**
	 * {{control.description}}
	 *
	 * @since {{theme.version}}
	 * @package {{theme.name}}
	 * @author  {{theme.author}}
	 */
	class {{control.className}} extends WP_Customize_Control {
		/**
		 * Control Type
		 *
		 * @var string
		 */
		public $type = '{{control.slugfn}}';

		/**
		 * Enqueue control related scripts/styles.
		 *
		 * @return void
		 */
		public function enqueue() {
			$theme_info = wp_get_theme();
			$theme_version = $theme_info->get( 'Version' );
			$asset_control_path = '/includes/customizers/controls/' . $this->type . '/assets/';
			$style_filename = 'css/style.css';
			$script_filename = 'js/script.js';

			$style_path = get_theme_file_path( $asset_control_path . $style_filename );
			if ( file_exists( $style_path ) ) {
				wp_enqueue_style( '{{theme.slug}}-{{control.slug}}-control', get_theme_file_uri( $asset_control_path . $style_filename ), array(), $theme_version );
			}

			$script_path = get_theme_file_path( $asset_control_path . $script_filename );
			if ( file_exists( $script_path ) ) {
				wp_enqueue_script( '{{theme.slug}}-{{control.slug}}-control', get_theme_file_uri( $asset_control_path . $script_filename ), array( 'jquery' ), $theme_version, true );
			}
		}

		/**
		 * Render the control's content.
		 *
		 * @return void
		 */
		public function render_content() {

		}
	}
endif;
