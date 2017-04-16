<?php
/**
 * Component Name: Posted-on
 * Description: Display post date and post author.
 *
 * @package {{themeName}}
 */

$date_time = get_the_date( 'c' );
$the_date = get_the_date();
$modified_date = get_the_modified_date();
$modified_date_format = get_the_modified_date( 'c' );
$author_id = get_the_author_meta( 'ID' );
?>

<span class="posted-on">
	<span class="posted-date">
		<?php echo esc_html_x( 'Posted on', 'post date', '{{textDomain}}' ); ?>
		<a href="<?php echo esc_url( get_permalink() ) ; ?>" rel="bookmark">
			<?php if ( get_the_time( 'U' ) !== get_the_modified_time( 'U' ) ) : ?>
				<time class="entry-date published" datetime="<?php echo $date_time; ?>"><?php echo $the_date; ?></time>
				<time class="updated" datetime="<?php echo $modified_date_format; ?>"><?php echo $modified_date; ?></time>
			<?php else: ?>
				<time class="entry-date published updated" datetime="<?php echo $date_time; ?>"><?php echo $the_date; ?></time>
			<?php endif; ?>
		</a>
	</span>

	<span class="byline">
		<?php echo esc_html_x( 'by', 'post author', '{{textDomain}}' ); ?>
		<span class="author vcard">
			<a class="url fn n" href="<?php echo esc_url( get_author_posts_url( $author_id ) ); ?>">
				<?php echo esc_html( get_the_author() ); ?>
			</a>
		</span>
	</span>
</span>
