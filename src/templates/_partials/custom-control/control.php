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
			$asset_path = get_template_directory_uri() . '/includes/customizers/' . $this->type . '/assets/';
			wp_enqueue_style( '{{control.slug}}-control', $asset_path . 'css/style.css' );
			wp_enqueue_script( '{{control.slug}}-control', $asset_path . 'js/script.js', array( 'jquery' ) );
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
