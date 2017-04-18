<?php
/**
 * The template for displaying the search pages.
 *
 * @package {{themeName}}
 * @since {{version}}
 */

get_header();
?>

<div id="content-wrapper" class="site__wrapper--search">
	<div id="content" class="content__wrapper" tabindex="-1">
		<main id="main" class="site__main">
			<header id="page-header" class="page__header--author">
				<h1 class="page-title"><?php printf( esc_html__( 'Search Results for: %s', '{{textDomain}}' ),
								'<span>' . get_search_query() . '</span>' ); ?></h1>
			</header><!-- #page-header -->

			<?php if ( have_posts() ) : ?>

				<?php while ( have_posts() ) : the_post(); ?>
					<?php
						// Load loop-templates for search page
						get_template_part( 'loop-templates/content', 'search' );
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
		<?php {{themeFnPrefix}}_pagination(); ?>

	</div><!-- #content -->

	<?php get_sidebar(); // load the sidebar ?>
</div><!-- #content-wrapper -->

<?php get_footer(); ?>
