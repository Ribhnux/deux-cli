<?php
/**
 * {{theme.name}} widgets
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

if ( ! function_exists( '{{theme.slugfn}}_widgets_init' ) ) :
	/**
	* Init all widgets from config.
	*
	* @return void
	*/
	function {{theme.slugfn}}_widgets_init() {
		global ${{theme.slugfn}}_config;

		foreach ( ${{theme.slugfn}}_config[ 'widgets' ] as $id => $widget ) {
			$widget[ 'id' ] = $id;
			register_sidebar( $widget );
		}
	}
endif;
add_action( 'widgets_init', '{{theme.slugfn}}_widgets_init' );
