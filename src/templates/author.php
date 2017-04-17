<?php
/**
 * The template for displaying the author pages.
 * Learn more: https://codex.wordpress.org/Author_Templates
 *
 * @package {{themeName}}
 */

get_header();

// Get current author
$current_author = get_userdata( intval( $author ) );
if ( isset( $_GET['author_name'] ) ) {
	$current_author = get_user_by( 'slug', $author_name );
}

// Get current author data
$author_id = $current_author->ID;
$author_nickname = $current_author->nickname;
$author_url = $current_author->user_url;
$author_desc = $current_author->user_description;
?>

<div id="content-wrapper" class="site__wrapper--author">
	<div id="content" class="content__wrapper" tabindex="-1">
		<main id="main" class="site__main">
			<header id="page-header" class="page__header--author">
				<h1><?php esc_html_e( 'About:', '{{textDomain}}' ); ?><?php echo esc_html( $author_nickname ); ?></h1>

				<?php if ( ! empty( $author_id ) ) : ?>
					<?php echo get_avatar( $author_id ); ?>
				<?php endif; ?>

				<dl>
					<?php if ( ! empty( $author_url ) ) : ?>
						<dt><?php esc_html_e( 'Website', '{{textDomain}}' ); ?></dt>
						<dd>
							<a href="<?php echo esc_html( $author_url ); ?>"><?php echo esc_html( $author_url ); ?></a>
						</dd>
					<?php endif; ?>

					<?php if ( ! empty( $author_desc ) ) : ?>
						<dt><?php esc_html_e( 'Profile', '{{textDomain}}' ); ?></dt>
						<dd><?php echo esc_html( $author_desc ); ?></dd>
					<?php endif; ?>
				</dl>

				<h2><?php esc_html_e( 'Posts by', '{{textDomain}}' ); ?> <?php echo esc_html( $author_nickname ); ?>
					:</h2>
			</header><!-- #page-header -->

			<?php if ( have_posts() ) : ?>
				<ul>
				<?php while ( have_posts() ) : the_post(); ?>
					<li>
						<a rel="bookmark" href="<?php the_permalink() ?>" title="Permanent Link: <?php the_title(); ?>"> <?php the_title(); ?></a>,
						<?php {{themeFnPrefix}}_posted_on(); ?>
						<?php esc_html_e( 'in', '{{textDomain}}' ); ?> <?php the_category( '&' ); ?>
					</li>
				<?php endwhile; // end of the loops ?>
				</ul>
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
