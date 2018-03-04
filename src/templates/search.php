<?php
/**
 * The template for displaying the search pages.
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

get_header();
?>

<div id="content-wrapper" class="site__wrapper--search">
	<div id="content" class="content__wrapper" tabindex="-1">
		<main id="main" class="site__main">
			<header id="page-header" class="page__header--author">
				<h1 class="page-title">
				<?php
					printf(
						/* translators: %s: search query */
						esc_html__( 'Search Results for: %s', '{{theme.slug}}' ),
						'<span>' . get_search_query() . '</span>'
					);
				?>
				</h1>
			</header><!-- #page-header -->

			<?php if ( have_posts() ) : ?>
				
				<?php
				while ( have_posts() ) :
					the_post();
					// Load partial-templates for search page.
					get_template_part( 'partial-templates/post/content', 'search' );
				endwhile; // end of the loops.
				?>

			<?php else : ?>

				<?php
					// Load partial-templates for empty content.
					get_template_part( 'partial-templates/post/content', 'none' );
				?>

			<?php endif; ?>
		</main><!-- #main -->

		<!-- The pagination component -->
		<?php {{theme.slugfn}}_pagination(); ?>

	</div><!-- #content -->

	<?php get_sidebar(); ?>
</div><!-- #content-wrapper -->

<?php get_footer(); ?>
