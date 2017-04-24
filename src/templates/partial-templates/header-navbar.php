<?php
/**
 * Display Navigation Bar
 *
 * @package {{themeName}}
 * @since {{version}}
 */
?>
<nav class="navbar">
	<?php
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
	?>
</nav>
