<?php
/**
 * Component Name: Post Meta
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

if ( ! function_exists( '{{theme.slugfn}}_post_meta' ) ) :
	/**
	 * Display meta information for the categories, tags and comments.
	 *
	 * @return void
	 */
	function {{theme.slugfn}}_post_meta() {
		$has_more_categories = false;

		// Create an array of all the categories that are attached to posts.
		$all_categories = get_transient( '{{theme.slugfn}}_categories' );

		if ( false === $all_categories ) {
			$all_categories = get_categories( array(
				'fields'     => 'ids',
				'hide_empty' => 1,
				// We only need to know if there is more than one category.
				'number'     => 2,
			) );

			// Count the number of categories that are attached to the posts.
			$all_categories = count( $all_categories );
			set_transient( '{{theme.slugfn}}_categories', $all_categories );
		}

		// This blog has more than 1 category.
		if ( $all_categories > 1 ) {
			$has_more_categories = true;
		}

		// Hide category and tag text for pages.
		if ( 'post' === get_post_type() ) {
			/* translators: used between list items, there is a space after the comma */
			$categories_list = get_the_category_list( esc_html__( ', ', '{{theme.slug}}' ) );
			if ( $categories_list && $has_more_categories ) {
				printf(
					/* translators: categories list */
					'<span class="cat-links">' . esc_html__( 'Posted in %1$s', '{{theme.slug}}' ) . '</span>',
					esc_html( $categories_list )
				); // WPCS: XSS OK.
			}

			/* translators: used between list items, there is a space after the comma */
			$tags_list = get_the_tag_list( '', esc_html__( ', ', '{{theme.slug}}' ) );
			if ( $tags_list ) {
				printf(
					/* translators: tag list */
					'<span class="tags-links">' . esc_html__( 'Tagged %1$s', '{{theme.slug}}' ) . '</span>',
					esc_html( $tags_list )
				); // WPCS: XSS OK.
			}
		}

		if ( ! is_single() && ! post_password_required() && ( comments_open() || get_comments_number() ) ) {
			echo '<span class="comments-link">';
			comments_popup_link( esc_html__( 'Leave a comment', '{{theme.slug}}' ), esc_html__( '1 Comment', '{{theme.slug}}' ), esc_html__( '% Comments', '{{theme.slug}}' ) );
			echo '</span>';
		}

		// Edit link.
		edit_post_link(
			sprintf(
				/* translators: %s: Name of current post */
				esc_html__( 'Edit %s', '{{theme.slug}}' ),
				the_title( '<span class="screen-reader-text">"', '"</span>', false )
			),
			'<span class="edit-link">',
			'</span>'
		);
	}
endif;
