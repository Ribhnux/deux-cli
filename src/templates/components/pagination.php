<?php
/**
 * Component Name: Pagination
 * Description: Pagination used for archive, author, and all pages that have page partials.
 *
 * @package {{themeName}}
 */

// Only for non-singular page or and page has at least 2
if ( ! is_singular() || $wp_query->max_num_pages > 1 ) :

	$paged = get_query_var( 'paged' ) ? absint( get_query_var( 'paged' ) ) : 1;
	$max   = intval( $wp_query->max_num_pages );

	// Listing links to array
	if ( $paged >= 1 ) {
		$links[] = $paged;
	}

	// Add the pages around the current page to the array
	if ( $paged >= 3 ) {
		$links[] = $paged - 1;
		$links[] = $paged - 2;
	}

	if ( ( $paged + 2 ) <= $max ) {
		$links[] = $paged + 2;
		$links[] = $paged + 1;
	}

	?>

	<nav aria-label="Page navigation">
		<ul class="pagination ">
		<?php
		// Link to first page, plus ellipses if necessary
		if ( ! in_array( 1, $links ) ) :
			$class_name = ( 1 == $paged ) ? 'active page-item' : 'page-item'; ?>
			<li class="<?php echo $class_name; ?>">
				<a class="page-link" href="<?php echo esc_url( get_pagenum_link( 1 ) ); ?>">
					<i class="fa fa-step-backward" aria-hidden="true"></i>
				</a>
			</li>
			<?php

			// Previous Post Link
			if ( get_previous_posts_link() ) : ?>
			<li class="page-item">
				<span class="page-link">
					<?php echo get_previous_posts_link( '<span aria-hidden="true">&laquo;</span><span class="sr-only">Previous page</span>' ); ?>
				</span>
			</li>
			<?php endif;

			if ( ! in_array( 2, $links ) ) : ?>
			<li class="page-item"></li>
			<?php endif;
		endif;

		// Link to current page, plus 2 pages in either direction if necessary.
		sort( $links );
		foreach ( (array) $links as $link ) :
			$class_name = ( $paged == $link ) ? 'active page-item' : 'page-item';
			?>
			<li class="<?php echo $class_name; ?>">
				<a href="<?php echo esc_url( get_pagenum_link( $link ) ); ?>" class="page-link">
					<?php echo $link; ?>
				</a>
			</li>
		<?php endforeach;

		// Next Post Link.
		if ( get_next_posts_link() ) : ?>
			<li class="page-item">
				<span class="page-link">
					<?php
						echo get_next_posts_link( '<span aria-hidden="true">&raquo;</span><span class="sr-only">Next page</span>' );
					?>
				</span>
			</li>
		<?php endif;

		// Link to last page, plus ellipses if necessary.
		if ( ! in_array( $max, $links ) ) :

			$class_name = ( $paged == $max ) ? 'active' : 'page-item';
			$href = esc_url( get_pagenum_link( esc_html( $max ) ) );

			if ( ! in_array( $max - 1, $links ) ) : ?>
				<li class="page-item"></li>
			<?php endif; ?>

			<li class="<?php echo $class_name; ?>">
				<a class="page-link" href="<?php echo $href; ?>" aria-label="Next">
					<span aria-hidden="true">
						<i class="fa fa-step-forward" aria-hidden="true"></i>
					</span>
					<span class="sr-only"><?php echo esc_html( $max ); ?></span>
				</a>
			</li>
		<?php endif; ?>
		</ul>
	</nav>
	<?php
endif;
