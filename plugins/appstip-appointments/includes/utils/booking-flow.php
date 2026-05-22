<?php
/**
 * Booking flow utilities — attribute parsing and rendering
 *
 * @package WPAppointments
 * @since 0.5.0
 */

namespace WPAppointments\Utils\BookingFlow;

use WPAppointments\Core\PluginInfo;

defined( 'ABSPATH' ) || exit;

/**
 * Get allowed values for booking flow arguments
 *
 * @return array Map of field names to their allowed values or type.
 *              Array values indicate allowed options, 'boolean' indicates a boolean field.
 */
function get_allowed_values() {
	return array(
		'flow_type'        => array( 'one_step', 'multi_step' ),
		'alignment'        => array( 'left', 'center', 'right' ),
		'width'            => array( 'narrow', 'full' ),
		'trim_unavailable' => 'boolean',
		'slots_as_buttons' => 'boolean',
	);
}

/**
 * Parse and convert snake_case arguments to camelCase with type handling
 *
 * Automatically detects boolean fields from the allowed values map and applies
 * filter_var for boolean casting. Other values use snake_to_pascal conversion.
 * Non-boolean values are validated against allowed options.
 *
 * @param array $attributes The input attributes (snake_case keys and values).
 * @param array $defaults Default values (snake_case keys).
 *
 * @return array Parsed attributes with camelCase keys and converted values.
 */
function parse_args( $attributes, $defaults ) {
	$attributes     = wp_parse_args( $attributes, $defaults );
	$allowed_values = get_allowed_values();
	$parsed         = array();

	foreach ( $attributes as $key => $value ) {
		$camel_key = snake_to_camel( $key );

		if ( ! isset( $allowed_values[ $key ] ) ) {
			continue;
		}

		if ( 'boolean' === $allowed_values[ $key ] ) {
			$parsed[ $camel_key ] = filter_var( $value, FILTER_VALIDATE_BOOLEAN );
			continue;
		}

		if ( is_array( $allowed_values[ $key ] ) && ! in_array( $value, $allowed_values[ $key ], true ) ) {
			$value = $defaults[ $key ];
		}

		$parsed[ $camel_key ] = snake_to_pascal( $value );
	}

	return $parsed;
}

/**
 * Convert a snake_case key to camelCase
 *
 * @param string $value Snake_case string (e.g. 'flow_type').
 *
 * @return string camelCase string (e.g. 'flowType').
 */
function snake_to_camel( $value ) {
	$parts = explode( '_', $value );
	return array_shift( $parts ) . implode( '', array_map( 'ucfirst', $parts ) );
}

/**
 * Convert a snake_case value to PascalCase
 *
 * @param string $value Snake_case string (e.g. 'one_step').
 *
 * @return string PascalCase string (e.g. 'OneStep').
 */
function snake_to_pascal( $value ) {
	$parts = explode( '_', $value );
	return implode( '', array_map( 'ucfirst', $parts ) );
}

/**
 * Render the booking flow HTML and enqueue required assets
 *
 * Shared by the shortcode, widget, and template tag.
 *
 * @param array $attributes Booking flow attributes (camelCase keys).
 *
 * @return string HTML output.
 */
function render_html( $attributes ) {
	enqueue_frontend_assets();

	/** This filter is documented in assets/gutenberg/blocks/booking-flow/src/render.php */
	$attributes = apply_filters( 'wpappointments_booking_flow_attributes', $attributes );

	// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Required for the view script to decode attributes.
	return sprintf(
		"<div class='wpappointments-booking-flow' data-attributes='%s'></div>",
		esc_attr( base64_encode( wp_json_encode( $attributes ) ) )
	);
}

/**
 * Enqueue the frontend scripts and styles required for the booking flow
 *
 * When the Gutenberg block is used, these are loaded automatically via
 * block.json viewScript/style. For shortcodes and widgets we must
 * enqueue them manually.
 *
 * @return void
 */
function enqueue_frontend_assets() {
	$plugin_dir  = PluginInfo::get_plugin_dir_path();
	$plugin_url  = PluginInfo::get_plugin_dir_url();
	$version     = PluginInfo::get_version();
	$view_handle = 'wpappointments-booking-flow-view';

	if ( wp_script_is( $view_handle, 'enqueued' ) ) {
		return;
	}

	$asset_path = $plugin_dir . 'build/booking-flow-block-view.tsx.asset.php';

	if ( ! file_exists( $asset_path ) ) {
		return;
	}

	$asset = require $asset_path;

	wp_enqueue_script(
		$view_handle,
		$plugin_url . 'build/booking-flow-block-view.tsx.js',
		$asset['dependencies'],
		$asset['version'],
		true
	);

	wp_enqueue_style(
		'wpappointments-frontend-css',
		$plugin_url . 'build/frontend.tsx.css',
		array(),
		$version
	);

	wp_enqueue_style(
		'wpappointments-booking-flow-view-css',
		$plugin_url . 'build/booking-flow-block-view.tsx.css',
		array(),
		$version
	);
}
