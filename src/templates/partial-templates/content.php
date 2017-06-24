<?php
/**
 * Post template to rendering get_template_part.
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

?>
<article <?php post_class(); ?> id="post-<?php the_ID(); ?>">
	<header class="entry-header">
		<?php the_title( sprintf( '<h2 class="entry-title"><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ),
		'</a></h2>' ); ?>

		<?php if ( 'post' === get_post_type() ) : ?>
			<div class="entry-meta">
				<?php {{theme.slugfn}}_posted_on(); ?>
			</div><!-- .entry-meta -->
		<?php endif; ?>
	</header><!-- .entry-header -->

	<?php echo get_the_post_thumbnail( $post->ID, 'large' ); ?>

	<div class="entry-content">
		<?php
			the_excerpt();
			wp_link_pages( array(
				'before' => '<div class="page-links">' . __( 'Pages:', '{{theme.slug}}' ),
				'after'  => '</div>',
			) );
		?>
	</div><!-- .entry-content -->

	<footer class="entry-footer">
		<?php {{theme.slugfn}}_post_meta(); ?>
	</footer><!-- .entry-footer -->
</article><!-- #post-## -->
