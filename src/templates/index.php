<?php
/**
 * The main template file
 *
 * This is the most generic template file in a WordPress theme and one
 * of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query,
 * e.g., it puts together the home page when no home.php file exists.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package {{themeName}}
 * @since {{version}}
 */

get_header();
?>

<div id="content-wrapper" class="site__wrapper--home">
	<div id="content" class="content__wrapper" tabindex="-1">
		<main id="main" class="site__main">
			<?php if ( have_posts() ) : ?>

				<?php while ( have_posts() ) : the_post(); ?>
					<?php
						// Load partial-templates for page
						get_template_part( 'partial-templates/content', get_post_format() );

						// Load the comment template when comments are open and at leas has 1 comment.
						if ( comments_open() || get_comments_number() ) :
							comments_template();
						endif;
					?>
				<?php endwhile; // end of the loops ?>

			<?php else : ?>

				<?php
					// Load partial-templates for empty content
					get_template_part( 'partial-templates/content', 'none' );
				?>

			<?php endif; ?>
		</main><!-- #main -->

		<!-- The pagination component -->
		<?php {{themeFnPrefix}}_pagination(); ?>

	</div><!-- #content -->

	<?php get_sidebar(); // load the sidebar ?>
</div><!-- #content-wrapper -->

<?php get_footer(); ?>
