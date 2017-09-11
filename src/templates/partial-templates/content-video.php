<?php
/**
 * Partial Template Name: Video Format
 *
 * Template for post-format video
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

?>

<article <?php post_class(); ?> id="post-<?php the_ID(); ?>">
	<header class="entry-header">
		<?php
		the_title(
			sprintf(
				'<h3 class="entry-title"><a href="%s" rel="bookmark">', esc_url( get_permalink() )
			),
			'</a></h3>'
		);
		?>

		<?php if ( 'post' === get_post_type() ) : ?>
			<div class="entry-meta">
				<?php deux_theme_posted_on(); ?>
			</div><!-- .entry-meta -->
		<?php endif; ?>
	</header><!-- .entry-header -->

	<?php
	$content = apply_filters( 'the_content', get_the_content() );
	$video = false;

	// Only get video from the content if a playlist isn't present.
	if ( false === strpos( $content, 'wp-playlist-script' ) ) {
		$video = get_media_embedded_in_content( $content, array( 'video', 'object', 'embed', 'iframe' ) );
	}
	?>

	<?php if ( '' !== get_the_post_thumbnail() && ! is_single() && empty( $video ) ) : ?>
		<?php echo get_the_post_thumbnail( $post->ID, 'large' ); ?>
	<?php endif; ?>

	<div class="entry-content">
		<?php
		if ( ! is_single() ) {
			// If not a single post, highlight the video file.
			if ( ! empty( $video ) ) {
				foreach ( $video as $video_html ) {
					echo '<div class="entry-video">';
					echo $video_html; // WPCS: xss ok.
					echo '</div>';
				}
			}
		}

		if ( is_single() || empty( $video ) ) {
			the_content();
			wp_link_pages(
				array(
					'before' => '<div class="page-links">' . __( 'Pages:', '{{theme.slug}}' ),
					'after'  => '</div>',
				)
			);
		}
		?>
	</div><!-- .entry-content -->

	<footer class="entry-footer">
		<?php deux_theme_post_meta(); ?>
	</footer><!-- .entry-footer -->
</article><!-- #post-## -->
