<?php
/**
 * Template Name: Page Content
 *
 * Page template for page.php.
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

?>
<article <?php post_class(); ?> id="post-<?php the_ID(); ?>">
	<header class="page-header">
		<h1 class="page-title"><?php esc_html_e( 'Oops! That page can&rsquo;t be found.', '{{theme.slug}}' ); ?></h1>
	</header><!-- .entry-header -->

	<div class="entry-content">
		<p>
		<?php
			esc_html_e(
				'It looks like nothing was found at this location. Maybe try one of the links below or a search?',
				'{{theme.slug}}'
			);
		?>
		</p>
	</div><!-- .entry-content -->

	<footer class="entry-footer">
		<?php edit_post_link( __( 'Edit', '{{theme.slug}}' ), '<span class="edit-link">', '</span>' ); ?>
	</footer><!-- .entry-footer -->
</article><!-- #post-## -->
