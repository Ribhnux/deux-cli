<?php
/**
 * Partial Template Name: Audio Format
 *
 * Template for post-format audio
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
	$audio = false;

	// Only get video from the content if a playlist isn't present.
	if ( false === strpos( $content, 'wp-playlist-script' ) ) {
		$audio = get_media_embedded_in_content( $content, array( 'video', 'object', 'embed', 'iframe' ) );
	}
	?>

	<?php if ( '' !== get_the_post_thumbnail() && ! is_single() && empty( $audio ) ) : ?>
		<?php echo get_the_post_thumbnail( $post->ID, 'large' ); ?>
	<?php endif; ?>

	<div class="entry-content">
		<?php
		if ( ! is_single() ) {
			// If not a single post, highlight the video file.
			if ( ! empty( $audio ) ) {
				foreach ( $audio as $audio_html ) {
					echo '<div class="entry-video">';
					echo wp_kses( $audio_html, array(
						'audio' => array(
							'autoplay' => array(),
							'buffered' => array(),
							'controls' => array(),
							'loop' => array(),
							'played' => array(),
							'preload' => array(),
							'src' => array(),
							'volume' => array(),
						),

						'track' => array(
							'default' => array(),
							'kind' => array(),
							'label' => array(),
							'src' => array(),
							'srclang' => array(),
						),

						'source' => array(
							'sizes' => array(),
							'src' => array(),
							'srcset' => array(),
							'type' => array(),
							'media' => array(),
						),

						'iframe' => array(
							'width' => array(),
							'height' => array(),
							'src' => array(),
							'frameborder' => array(),
							'allowfullscreen' => array(),
							'srcdoc' => array(),
						),
					) );
					echo '</div>';
				}
			}
		}

		if ( is_single() || empty( $audio ) ) {
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
