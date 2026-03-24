<?php
/**
 * Booking flow attribute parsing utilities
 *
 * @package WPAppointments
 * @since 0.5.0
 */

namespace WPAppointments\Utils\BookingFlow;

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
