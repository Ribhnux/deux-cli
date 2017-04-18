<?php
/**
 * The template for displaying all pages.
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site will use a
 * different template.
 *
 * @package {{themeName}}
 * @since {{version}}
 */

get_header();
?>

<div id="content-wrapper" class="site__wrapper--page">
	<div id="content" class="content__wrapper" tabindex="-1">
		<main id="main" class="site__main">

			<?php while ( have_posts() ) : the_post(); ?>
				<?php
					// Load loop-templates for page
					get_template_part( 'loop-templates/content', 'page' );

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
