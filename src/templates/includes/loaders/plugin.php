<?php
/**
 * {{theme.name}} plugin setup
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

foreach ( ${{theme.slugfn}}_config['plugins'] as $slug => $plugin ) {
	if ( $plugin['init'] ) {
		require {{#if theme.parent}}get_template_directory(){{else}}get_stylesheet_directory(){{/if}} . '/includes/plugins/' . $slug . '.php';
	}
}

if ( ! function_exists( '{{theme.slugfn}}_tgmpa_register' ) ) :
	/**
	 * Register plugin dependencies using TGMPA
	 *
	 * @return void
	 */
	function {{theme.slugfn}}_tgmpa_register() {
		global ${{theme.slugfn}}_config;

		/**
		* Read plugins from config
		*
		* @var array
		*/
		$plugins = array();
		foreach ( ${{theme.slugfn}}_config['plugins'] as $slug => $plugin ) {
			$plugin['slug'] = $slug;
			unset( $plugin['init'] );
			unset( $plugin['srctype'] );
			$plugins[] = $plugin;
		}

		/**
		* TMGPA Config
		*
		* @var array
		*/
		$config = array(
			'id'           => '{{theme.slug}}',
			'default_path' => '',
			'menu'         => '{{theme.slug}}-install-plugins',
			'has_notices'  => true,
			'dismissable'  => true,
			'dismiss_msg'  => '',
			'is_automatic' => false,
			'message'      => '',
		);

		tgmpa( $plugins, $config );
	}
endif;
add_action( 'tgmpa_register', '{{theme.slugfn}}_tgmpa_register' );
