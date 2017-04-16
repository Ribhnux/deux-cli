<?php
/**
 * {{themeName}} plugin setup
 *
 * @package {{themeName}}
 */

require_once get_template_directory() . '/includes/lib/class-tgm-plugin-activation.php';
add_action( 'tgmpa_register', '{{themeFnPrefix}}_tgmpa_register' );

function {{themeFnPrefix}}_tgmpa_register() {
	/**
	 * Read plugins from config
	 * @var array
	 */
	$plugins = array();

	/**
	 * TMGPA Config
	 * @var array
	 */
	$config = array(
		'id'           => 'theme-name',
		'default_path' => '',
		'menu'         => 'tgmpa-install-plugins',
		'has_notices'  => true,
		'dismissable'  => true,
		'dismiss_msg'  => '',
		'is_automatic' => false,
		'message'      => ''
	);

	tgmpa( $plugins, $config );
}
