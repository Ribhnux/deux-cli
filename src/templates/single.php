<?php
/**
 * The template for displaying all single posts.
 *
 * @package {{themeName}}
 * @since {{version}}
 */

get_header();
?>

<div id="content-wrapper" class="site__wrapper--single">
	<div id="content" class="content__wrapper" tabindex="-1">
		<main id="main" class="site__main">

			<?php while ( have_posts() ) : the_post(); ?>
				<?php
					// Load loop-templates for single page
					get_template_part( 'loop-templates/content', 'single' );

					// Load the comment template when comments are open and at leas has 1 comment.
					if ( comments_open() || get_comments_number() ) :
						comments_template();
					endif;
				?>
			<?php endwhile; // end of the loops ?>

		</main><!-- #main -->
	</div><!-- #content -->

	<?php get_sidebar(); // load the sidebar ?>
</div><!-- #content-wrapper -->

<?php get_footer(); ?>
