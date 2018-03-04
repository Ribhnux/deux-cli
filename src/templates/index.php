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
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

get_header();
?>

<div class="siteWrapper-home">
	<div id="content-wrapper" class="contentWrapper" tabindex="-1">
		<main id="main" class="siteMain">
			<?php
			if ( have_posts() ) :
				while ( have_posts() ) :
					// Setup the post.
					the_post();

					// Load partial-templates for page.
					get_template_part( 'partial-templates/post/content', get_post_format() );

					// Load the comment template when comments are open and at leas has 1 comment.
					if ( comments_open() || get_comments_number() ) :
						comments_template();
					endif;

				endwhile; // end of the loops.

			else :

				// Load partial-templates for empty content.
				get_template_part( 'partial-templates/post/content', 'none' );

			endif;
			?>
		</main><!-- #main -->

		<!-- The pagination component -->
		<?php {{theme.slugfn}}_pagination(); ?>

	</div><!-- #content -->

	<?php get_sidebar(); ?>
</div><!-- #content-wrapper -->

<?php get_footer(); ?>
