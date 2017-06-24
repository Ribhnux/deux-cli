<?php
/**
 * Component Name: Pagination
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

if ( ! function_exists( '{{theme.slugfn}}_pagination' ) ) :
	/**
	 * Pagination used for archive, author, and all pages that have page partials.
	 *
	 * @return void
	 */
	function {{theme.slugfn}}_pagination() {
		global $wp_query;

		if ( is_singular() && $wp_query->max_num_pages <= 1 ) {
			return;
		}

		$paged = get_query_var( 'paged' ) ? absint( get_query_var( 'paged' ) ) : 1;
		$max   = intval( $wp_query->max_num_pages );

		// Add current page to the array.
		if ( $paged >= 1 ) {
			$links[] = $paged;
		}

		// Add the pages around the current page to the array.
		if ( $paged >= 3 ) {
			$links[] = $paged - 1;
			$links[] = $paged - 2;
		}
		if ( ( $paged + 2 ) <= $max ) {
			$links[] = $paged + 2;
			$links[] = $paged + 1;
		}
		echo '<nav aria-label="Page navigation"><ul class="pagination ">' . "\n";

		// Link to first page, plus ellipses if necessary.
		if ( ! in_array( 1, $links, true ) ) {
			$class = 1 === $paged ? 'active page-item' : 'page-item';
			printf(
				'<li class="%s"><a class="page-link" href="%s"><i class="fa fa-step-backward" aria-hidden="true"></i></a></li>' . "\n",
				esc_attr( $class ),
				esc_url( get_pagenum_link( 1 ) ),
				'1'
			);

			// Previous Post Link.
			if ( get_previous_posts_link() ) {
				printf( // WPCS: XSS ok.
					'<li class="page-item"><span class="page-link">%1$s</span></li> ' . "\n",
					get_previous_posts_link( '<span aria-hidden="true">&laquo;</span><span class="sr-only">Previous page</span>' )
				);
			}
			if ( ! in_array( 2, $links, true ) ) {
				echo '<li class="page-item"></li>';
			}
		}

		// Link to current page, plus 2 pages in either direction if necessary.
		sort( $links );
		foreach ( (array) $links as $link ) {
			$class = $paged === $link ? 'active page-item' : 'page-item';
			printf(
				'<li class="%s"><a href="%s" class="page-link">%s</a></li>' . "\n",
				esc_attr( $class ),
				esc_url( get_pagenum_link( $link ) ),
				esc_html( $link )
			);
		}

		// Next Post Link.
		if ( get_next_posts_link() ) {
			printf( // WPCS: XSS ok.
				'<li class="page-item"><span class="page-link">%s</span></li>' . "\n",
				get_next_posts_link( '<span aria-hidden="true">&raquo;</span><span class="sr-only">Next page</span>' )
			);
		}

		// Link to last page, plus ellipses if necessary.
		if ( ! in_array( $max, $links, true ) ) {
			if ( ! in_array( $max - 1, $links, true ) ) {
				echo '<li class="page-item"></li>' . "\n";
			}

			$class = $paged === $max ? 'active' : 'page-item';
			printf(
				'<li class="%s"><a class="page-link" href="%s" aria-label="Next"><span aria-hidden="true"><i class="fa fa-step-forward" aria-hidden="true"></i></span><span class="sr-only">%s</span></a></li>' . "\n",
				esc_attr( $class ),
				esc_url( get_pagenum_link( esc_html( $max ) ) ),
				esc_html( $max )
			);
		}
		echo '</ul></nav>' . "\n";
	}
endif;
