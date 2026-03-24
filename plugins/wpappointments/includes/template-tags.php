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

require_once __DIR__ . '/utils/booking-flow.php';

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

	$attributes = \WPAppointments\Utils\BookingFlow\parse_args( $attributes, $defaults );

	echo wp_kses(
		\WPAppointments\Shortcode\render_booking_flow_html( $attributes ),
		array(
			'div' => array(
				'class'           => array(),
				'style'           => array(),
				'data-attributes' => array(),
			),
		)
	);
}
