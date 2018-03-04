<?php
/**
 * The template for displaying all pages.
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site will use a
 * different template.
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

get_header();
?>

<div class="siteWrapper-page">
	<div id="content-wrapper" class="contentWrapper" tabindex="-1">
		<main id="main" class="siteMain">
			<?php
			while ( have_posts() ) :
				the_post();

				// Load partial-templates for page.
				get_template_part( 'partial-templates/post/content', 'page' );

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
