<?php
/**
 * Sidebar widget.
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

?>

<!-- Sidebar codes here -->
<?php if ( is_active_sidebar( '' ) ) : ?>
	<?php dynamic_sidebar( '' ); ?>
<?php endif; ?>
