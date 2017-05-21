<?php
/**
 * {{themeName}} plugin setup
 *
 * @package {{themeName}}
 */

require_once get_template_directory() . '/includes/class/class-tgm-plugin-activation.php';

foreach ( ${{themeFnPrefix}}_config[ 'plugins' ] as $slug => $plugin ) {
	if ( $plugin[ 'init' ] ) {
		require get_template_directory() . '/plugins/' . $slug . '.php';
	}
}

if ( ! function_exists( '{{themeFnPrefix}}_tgmpa_register' ) ) :
function {{themeFnPrefix}}_tgmpa_register() {
	global ${{themeFnPrefix}}_config;

	/**
	 * Read plugins from config
	 * @var array
	 */
	$plugins = array();
	foreach ( ${{themeFnPrefix}}_config[ 'plugins' ] as $slug => $plugin ) {
		$plugin[ 'slug' ] = $slug;
		unset( $plugin[ 'init' ] );
		$plugins[] = $plugin;
	}

	/**
	 * TMGPA Config
	 * @var array
	 */
	$config = array(
		'id'           => '{{textDomain}}',
		'default_path' => '',
		'menu'         => '{{textDomain}}-install-plugins',
		'has_notices'  => true,
		'dismissable'  => true,
		'dismiss_msg'  => '',
		'is_automatic' => false,
		'message'      => ''
	);

	tgmpa( $plugins, $config );
}
endif;
add_action( 'tgmpa_register', '{{themeFnPrefix}}_tgmpa_register' );
