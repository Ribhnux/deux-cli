<?php
/**
 * The template for displaying search forms
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */
?>
<form class="search-form" method="get" id="searchform" action="<?php echo esc_url( home_url( '/' ) ); ?>" role="search">
	<label for="s"><?php esc_html_e( 'Search', '{{theme.slug}}' ); ?></label>
	<div class="search-form__input">
		<input class="field" id="s" name="s" type="text" placeholder="<?php esc_attr_e( 'Search &hellip;', '{{theme.slug}}' ); ?>">
		<span class="search-form__input-button">
			<input class="submit" id="searchsubmit" name="submit" type="submit" value="<?php esc_attr_e( 'Search', '{{theme.slug}}' ); ?>">
		</span>
	</div>
</form>
