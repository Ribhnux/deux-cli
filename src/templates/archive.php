<?php
/**
 * The template for displaying archive pages.
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 * @package {{themeName}}
 */

get_header();
?>

<div class="site__wrapper--archive">
	<div id="content" class="content__wrapper" tabindex="-1">
		<main id="main" class="site__main">
			<?php if ( have_posts() ) : ?>

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

			<?php else : ?>

				<?php
					// Load loop-templates for empty content
					get_template_part( 'loop-templates/content', 'none' );
				?>

			<?php endif; ?>
		</main><!-- #main -->

		<!-- The pagination component -->
		<?php include get_template_directory() . '/components/pagination.php'; ?>

	</div><!-- #content -->

	<?php get_sidebar(); // load the sidebar ?>
</div>

<?php get_footer(); ?>
