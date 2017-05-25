<?php
/**
 * {{themeName}} setup
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package {{themeName}}
 * @since {{version}}
 */

/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support for post thumbnails.
 */
if ( ! function_exists( '{{themeFnPrefix}}_setup' ) ):
function {{themeFnPrefix}}_setup() {
	global ${{themeFnPrefix}}_config;

	// Make theme available for translation.
	load_theme_textdomain( '{{textDomain}}' );

	/*
	 * Let WordPress manage the document title.
	 * By adding theme support, we declare that this theme does not use a
	 * hard-coded <title> tag in the document head, and expect WordPress to
	 * provide it for us.
	 */
	add_theme_support( 'title-tag' );

	/*
	 * Init theme supports.
	 */
	foreach ( ${{themeFnPrefix}}_config['features'] as $name => $value ) {
		if ( is_bool ( $value ) ) {
			add_theme_support( $name );
		}

		if ( is_array ( $value ) ) {
			$features = array();
			foreach ( $value as $key => $val ) {
				if ( is_string ( $val ) ) {
					$features[] = $val;
				}

				if ( is_array ( $val ) ) {
					$features[$key] = $val;
				}
			}
			add_theme_support( $name, $features );
		}
	}

	/*
	//  * Enable support for Post Thumbnails on posts and pages.
	//  *
	//  * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
	//  */
	// add_theme_support( 'post-thumbnails' );

	// add_image_size( '{{textDomain}}-featured-image', 2000, 1200, true );

	// add_image_size( '{{textDomain}}-thumbnail-avatar', 100, 100, true );

	// // Set the default content width.
	// $GLOBALS['content_width'] = 525;

	// // This theme uses wp_nav_menu() in two locations.
	// register_nav_menus( array(
	// 	'top'    => __( 'Top Menu', '{{textDomain}}' ),
	// 	'social' => __( 'Social Links Menu', '{{textDomain}}' ),
	// ) );

	// /*
	//  * Switch default core markup for search form, comment form, and comments
	//  * to output valid HTML5.
	//  */
	// add_theme_support( 'html5', array(
	// 	'comment-form',
	// 	'comment-list',
	// 	'gallery',
	// 	'caption',
	// ) );

	// /*
	//  * Enable support for Post Formats.
	//  *
	//  * See: https://codex.wordpress.org/Post_Formats
	//  */
	// add_theme_support( 'post-formats', array(
	// 	'aside',
	// 	'image',
	// 	'video',
	// 	'quote',
	// 	'link',
	// 	'gallery',
	// 	'audio',
	// ) );

	// // Add theme support for Custom Logo.
	// add_theme_support( 'custom-logo', array(
	// 	'width'       => 250,
	// 	'height'      => 250,
	// 	'flex-width'  => true,
	// ) );

	// // Add theme support for selective refresh for widgets.
	// add_theme_support( 'customize-selective-refresh-widgets' );

	// /*
	//  * This theme styles the visual editor to resemble the theme style,
	//  * specifically font, colors, and column width.
 // 	 */
	// add_editor_style( array( 'assets/css/editor-style.css', {{themeFnPrefix}}_fonts_url() ) );

	// // Define and register starter content to showcase the theme on new sites.
	// $starter_content = array(
	// 	'widgets' => array(
	// 		// Place three core-defined widgets in the sidebar area.
	// 		'sidebar-1' => array(
	// 			'text_business_info',
	// 			'search',
	// 			'text_about',
	// 		),

	// 		// Add the core-defined business info widget to the footer 1 area.
	// 		'sidebar-2' => array(
	// 			'text_business_info',
	// 		),

	// 		// Put two core-defined widgets in the footer 2 area.
	// 		'sidebar-3' => array(
	// 			'text_about',
	// 			'search',
	// 		),
	// 	),

	// 	// Specify the core-defined pages to create and add custom thumbnails to some of them.
	// 	'posts' => array(
	// 		'home',
	// 		'about' => array(
	// 			'thumbnail' => '{{image-sandwich}}',
	// 		),
	// 		'contact' => array(
	// 			'thumbnail' => '{{image-espresso}}',
	// 		),
	// 		'blog' => array(
	// 			'thumbnail' => '{{image-coffee}}',
	// 		),
	// 		'homepage-section' => array(
	// 			'thumbnail' => '{{image-espresso}}',
	// 		),
	// 	),

	// 	// Create the custom image attachments used as post thumbnails for pages.
	// 	'attachments' => array(
	// 		'image-espresso' => array(
	// 			'post_title' => _x( 'Espresso', 'Theme starter content', '{{textDomain}}' ),
	// 			'file' => 'assets/images/espresso.jpg', // URL relative to the template directory.
	// 		),
	// 		'image-sandwich' => array(
	// 			'post_title' => _x( 'Sandwich', 'Theme starter content', '{{textDomain}}' ),
	// 			'file' => 'assets/images/sandwich.jpg',
	// 		),
	// 		'image-coffee' => array(
	// 			'post_title' => _x( 'Coffee', 'Theme starter content', '{{textDomain}}' ),
	// 			'file' => 'assets/images/coffee.jpg',
	// 		),
	// 	),

	// 	// Default to a static front page and assign the front and posts pages.
	// 	'options' => array(
	// 		'show_on_front' => 'page',
	// 		'page_on_front' => '{{home}}',
	// 		'page_for_posts' => '{{blog}}',
	// 	),

	// 	// Set the front page section theme mods to the IDs of the core-registered pages.
	// 	'theme_mods' => array(
	// 		'panel_1' => '{{homepage-section}}',
	// 		'panel_2' => '{{about}}',
	// 		'panel_3' => '{{blog}}',
	// 		'panel_4' => '{{contact}}',
	// 	),

	// 	// Set up nav menus for each of the two areas registered in the theme.
	// 	'nav_menus' => array(
	// 		// Assign a menu to the "top" location.
	// 		'top' => array(
	// 			'name' => __( 'Top Menu', '{{textDomain}}' ),
	// 			'items' => array(
	// 				'link_home', // Note that the core "home" page is actually a link in case a static front page is not used.
	// 				'page_about',
	// 				'page_blog',
	// 				'page_contact',
	// 			),
	// 		),

	// 		// Assign a menu to the "social" location.
	// 		'social' => array(
	// 			'name' => __( 'Social Links Menu', '{{textDomain}}' ),
	// 			'items' => array(
	// 				'link_yelp',
	// 				'link_facebook',
	// 				'link_twitter',
	// 				'link_instagram',
	// 				'link_email',
	// 			),
	// 		),
	// 	),
	// );

	// /**
	//  * Filters {{themeName}} array of starter content.
	//  *
	//  * @since {{themeName}} 1.1
	//  *
	//  * @param array $starter_content Array of starter content.
	//  */
	// $starter_content = apply_filters( '{{themeFnPrefix}}_starter_content', $starter_content );

	// add_theme_support( 'starter-content', $starter_content );
}
endif;

add_action( 'after_setup_theme', '{{themeFnPrefix}}_setup' );
