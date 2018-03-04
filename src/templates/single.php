<?php
/**
 * The template for displaying all single posts.
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

get_header();
?>

<div class="siteWrapper-single">
	<div id="content-wrapper" class="contentWrapper" tabindex="-1">
		<main id="main" class="siteMain">

			<?php
			while ( have_posts() ) :
				// Load the post.
				the_post();

				// Load partial-templates for single page.
				get_template_part( 'partial-templates/post/content', 'single' );

				// Load the comment template when comments are open and at leas has 1 comment.
				if ( comments_open() || get_comments_number() ) :
					comments_template();
				endif;

			endwhile; // end of the loops.
			?>

		</main><!-- #main -->
	</div><!-- #content -->

	<?php get_sidebar(); ?>
</div><!-- #content-wrapper -->

<?php get_footer(); ?>
