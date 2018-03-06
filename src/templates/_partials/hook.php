<?php
/**
 * {{hooks.typeUpper}} Name: {{hooks.name}}
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

if ( ! function_exists ( '{{theme.slugfn}}_{{hooks.slugfn}}_{{hooks.type}}' ) ):
	/**
	 * {{hooks.description}}
	 *
	 * @return void
	 */
	function {{theme.slugfn}}_{{hooks.slugfn}}_{{hooks.type}}() {

	}
endif;
add_{{hooks.type}}( '{{hooks.fn}}', '{{theme.slugfn}}_{{hooks.slugfn}}_{{hooks.type}}', {{hooks.priority}} );
