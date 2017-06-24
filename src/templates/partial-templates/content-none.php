<?php
/**
 * 404 post template and all page that cannot be found.
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

?>

<section class="no-results not-found">
	<header id="page-header" class="page__header--not-found">
		<h1 id="page-title" class="page__title--not-found"><?php esc_html_e( 'Nothing Found', '{{theme.slug}}' ); ?></h1>
	</header><!-- #page-header -->

	<div id="page-content" class="page__content">
		<?php if ( is_home() && current_user_can( 'publish_posts' ) ) : ?>
			<p><?php
				printf(
					wp_kses(
						/* translators: new post link to wp-admin */
						__( 'Hey, Wanna publish your first post? <a href="%1$s">Let&rsquo;s Get Started</a>.', '{{theme.slug}}' ),
						array(
							'a' => array(
								'href' => array(),
							),
						),
					),
					esc_url( admin_url( 'post-new.php' ) )
				);
			?></p>

		<?php elseif ( is_search() ) : ?>

			<p><?php esc_html_e( 'Sorry, but nothing matched your search terms. Please try again with some different keywords.', '{{theme.slug}}' ); ?></p>

		<?php get_search_form(); ?>
		<?php else : ?>

			<p><?php esc_html_e( 'It seems we can&rsquo;t find what you&rsquo;re looking for. Perhaps searching can help.', '{{theme.slug}}' ); ?></p>

		<?php get_search_form(); ?>
		<?php endif; ?>
	</div><!-- #page-content -->
</section><!-- .no-results -->
