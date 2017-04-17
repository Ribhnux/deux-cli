<?php
/**
 * Component Name: Navigation Bar
 * Description: Display Navigation bar based on WordPress Menu
 *
 * @package {{themeName}}
 */

if ( ! function_exists( '{{themeFnPrefix_navbar}}' ) ):
function {{themeFnPrefix}}_navbar() {
	echo '<nav class="navbar">';
	wp_nav_menu(
		array(
			'theme_location'  => 'primary',
			'container_class' => 'navbar__container',
			'container_id'    => 'navbar-container',
			'menu_class'      => 'navbar__menu',
			'fallback_cb'     => '',
			'menu_id'         => 'navbar__main-menu'
		)
	);
	echo '</nav>';
}
endif;
