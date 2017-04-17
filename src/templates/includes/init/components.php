<?php
/**
 * {{themeName}} components loader
 *
 * @package {{themeName}}
 */

foreach ( $deux_config['components'] as $component ) {
	require get_template_directory() . '/components/' . $component . '.php';
}
