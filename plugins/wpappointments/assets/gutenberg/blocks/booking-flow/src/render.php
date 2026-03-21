<?php
/**
 * Render booking flow block
 *
 * @package WPAppointments
 * @since 0.0.1
 */

/**
 * Filter block attributes before rendering.
 *
 * Allows addons to modify block attributes (e.g., add custom fields,
 * change defaults) before the booking flow is rendered.
 *
 * @param array $attributes Block attributes.
 */
$attributes = apply_filters( 'wpappointments_booking_flow_attributes', $attributes );

$element = sprintf(
	"<div class='wpappointments-booking-flow' data-attributes='%s'></div>",
	base64_encode( wp_json_encode( $attributes ) )
);

/**
 * Filter the booking flow block HTML output.
 *
 * Allows addons to wrap or modify the rendered block output.
 *
 * @param string $output     The rendered block HTML.
 * @param array  $attributes Block attributes.
 */
$block_output = sprintf(
	'<div %s>%s</div>',
	esc_attr( get_block_wrapper_attributes() ),
	wp_kses(
		$element,
		array(
			'div' => array(
				'class'           => array(),
				'data-attributes' => array(),
			),
		)
	)
);

echo wp_kses_post( apply_filters( 'wpappointments_booking_flow_output', $block_output, $attributes ) );
