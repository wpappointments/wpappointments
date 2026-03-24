<?php
/**
 * Global template tags for theme developers
 *
 * These functions are intentionally in the global namespace so theme
 * developers can call them directly in templates without a `use` statement.
 *
 * @package WPAppointments
 * @since 0.5.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * Render the WP Appointments booking flow
 *
 * Usage in theme templates:
 *   <?php wpappointments_render_booking_flow(); ?>
 *   <?php wpappointments_render_booking_flow( array( 'flow_type' => 'multi_step' ) ); ?>
 *
 * @param array $attributes Optional booking flow attributes (snake_case keys and values).
 *
 * @return void
 */
function wpappointments_render_booking_flow( $attributes = array() ) {
	$defaults = array(
		'flow_type'        => 'one_step',
		'alignment'        => 'left',
		'width'            => 'narrow',
		'trim_unavailable' => true,
		'slots_as_buttons' => false,
	);

	$attributes = wp_parse_args( $attributes, $defaults );

	$camel = array(
		'flowType'        => wpappointments_snake_to_camel_value( $attributes['flow_type'] ),
		'alignment'       => ucfirst( $attributes['alignment'] ),
		'width'           => ucfirst( $attributes['width'] ),
		'trimUnavailable' => (bool) $attributes['trim_unavailable'],
		'slotsAsButtons'  => (bool) $attributes['slots_as_buttons'],
	);

	echo wp_kses(
		\WPAppointments\Shortcode\render_booking_flow_html( $camel ),
		array(
			'div' => array(
				'class'           => array(),
				'style'           => array(),
				'data-attributes' => array(),
			),
		)
	);
}

/**
 * Convert a snake_case value to CamelCase
 *
 * @param string $value Snake_case string (e.g. 'one_step').
 *
 * @return string CamelCase string (e.g. 'OneStep').
 */
function wpappointments_snake_to_camel_value( $value ) {
	return str_replace( ' ', '', ucwords( str_replace( '_', ' ', $value ) ) );
}
