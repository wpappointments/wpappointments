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
 *   <?php wpappointments_render_booking_flow( array( 'flowType' => 'MultiStep' ) ); ?>
 *
 * @param array $attributes Optional booking flow attributes.
 *                          Accepted keys: flowType, alignment, width, trimUnavailable, slotsAsButtons.
 *
 * @return void
 */
function wpappointments_render_booking_flow( $attributes = array() ) {
	$defaults = array(
		'flowType'        => 'OneStep',
		'alignment'       => 'Left',
		'width'           => 'Narrow',
		'trimUnavailable' => true,
		'slotsAsButtons'  => false,
	);

	$attributes = wp_parse_args( $attributes, $defaults );

	echo wp_kses(
		\WPAppointments\Shortcode\render_booking_flow_html( $attributes ),
		array(
			'div' => array(
				'class'           => array(),
				'data-attributes' => array(),
			),
		)
	);
}
