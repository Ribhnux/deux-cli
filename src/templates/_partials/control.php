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
		 * Render the control's content.
		 *
		 * @return void
		 */
		public function render_content() {

		}
	}
endif;
