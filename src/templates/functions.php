<?php
/**
 * {{theme.name}} functions, hooks, and init
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

// Read theme config.
require {{#if theme.parent}}get_stylesheet_directory(){{else}}get_template_directory(){{/if}} . '/{{theme.slug}}-config.php';

// Function helpers.
require {{#if theme.parent}}get_stylesheet_directory(){{else}}get_template_directory(){{/if}} . '/includes/loaders/helper.php';

// Class libraries.
require {{#if theme.parent}}get_stylesheet_directory(){{else}}get_template_directory(){{/if}} . '/includes/loaders/libclass.php';

// Theme setup.
require {{#if theme.parent}}get_stylesheet_directory(){{else}}get_template_directory(){{/if}} . '/includes/loaders/theme.php';

// Widgets init.
require {{#if theme.parent}}get_stylesheet_directory(){{else}}get_template_directory(){{/if}} . '/includes/loaders/widget.php';

// Plugin dependencies init.
require {{#if theme.parent}}get_stylesheet_directory(){{else}}get_template_directory(){{/if}} . '/includes/loaders/plugin.php';

// Actions and Filters init.
require {{#if theme.parent}}get_stylesheet_directory(){{else}}get_template_directory(){{/if}} . '/includes/loaders/hook.php';

// Assets (JS, CSS, Fonts) init.
require {{#if theme.parent}}get_stylesheet_directory(){{else}}get_template_directory(){{/if}} . '/includes/loaders/asset.php';

// Components init.
require {{#if theme.parent}}get_stylesheet_directory(){{else}}get_template_directory(){{/if}} . '/includes/loaders/component.php';

// Customizers init.
require {{#if theme.parent}}get_stylesheet_directory(){{else}}get_template_directory(){{/if}} . '/includes/loaders/customizer.php';
