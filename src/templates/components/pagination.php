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
		the_posts_pagination( array(
			'prev_text' => '&laquo; <span class="screen-reader-text">' . __( 'Previous page', '{{theme.slug}}' ) . '</span>',
			'next_text' => '<span class="screen-reader-text">' . __( 'Next page', '{{theme.slug}}' ) . '</span> &raquo;',
		) );
	}
endif;
