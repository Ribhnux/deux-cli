<?php
/**
 * The Header for our theme
 *
 * Displays all of the <head> section and everything up till <div id="page">
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

?><!DOCTYPE html>
<!--[if IE 7]>
<html class="ie ie7" <?php language_attributes(); ?>>
<![endif]-->
<!--[if IE 8]>
<html class="ie ie8" <?php language_attributes(); ?>>
<![endif]-->
<!--[if !(IE 7) & !(IE 8)]><!-->
<html <?php language_attributes(); ?>>
<!--<![endif]-->
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="profile" href="http://gmpg.org/xfn/11">

<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
	<div id="page">
		<a class="skip-link screen-reader-text" href="#content"><?php esc_html_e( 'Skip to content', '{{theme.slug}}' ); ?></a>

		<div id="site-wrapper" class="siteWrapper">
			<header class="pageHeader">
				<div class="siteTitle">
					<?php if ( is_home() ) : ?>
					<h1>
						<a rel="home" href="<?php echo esc_url( home_url( '/' ) ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>"><?php bloginfo( 'name' ); ?></a>
					</h1>
					<?php else : ?>
					<a rel="home" href="<?php echo esc_url( home_url( '/' ) ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>"><?php bloginfo( 'name' ); ?></a>
					<?php endif; ?>
				</div>
				<?php
					// Display navigation bar.
					get_template_part( 'partial-templates/header/navbar' );
				?>
			</header>
