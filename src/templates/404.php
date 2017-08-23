<?php
/**
 * The template for displaying 404 pages (not found).
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

get_header();
?>
 
<div id="content-wrapper" class="site__wrapper--page">
	<div id="content" class="content__wrapper" tabindex="-1">
		<main id="main" class="site__main">
			<?php get_template_part( 'partial-templates/content', 'not-found' ); ?>
		</main><!-- #main -->
	</div><!-- #content -->

	<?php get_sidebar(); ?>
</div><!-- #content-wrapper -->

<?php get_footer(); ?>
