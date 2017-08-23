<?php
/**
 * Template Name: Search Content
 *
 * Search page template.
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

?>
<article <?php post_class(); ?> id="post-<?php the_ID(); ?>">
	<header class="entry-header">
		<?php
			the_title(
				sprintf( '<h2 class="entry-title"><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ),
				'</a></h2>'
			);
		?>

		<?php if ( 'post' === get_post_type() ) : ?>
			<div class="entry-meta">
				<?php {{theme.slugfn}}_posted_on(); ?>
			</div><!-- .entry-meta -->
		<?php endif; ?>
	</header><!-- .entry-header -->

	<div class="entry-summary">
		<?php the_excerpt(); ?>
	</div><!-- .entry-summary -->

	<footer class="entry-footer">
		<?php {{theme.slugfn}}_post_meta(); ?>
	</footer><!-- .entry-footer -->
</article><!-- #post-## -->
