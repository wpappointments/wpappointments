<?php
/**
 * Shortcode and widget registration for the booking flow
 *
 * Provides non-Gutenberg embedding alternatives:
 * - [wpappointments] shortcode
 * - WP Appointments Booking Flow widget (classic themes / sidebars)
 *
 * @package WPAppointments
 * @since 0.5.0
 */

namespace WPAppointments\Shortcode;

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/class-booking-flow-widget.php';

/**
 * Register the [wpappointments] shortcode.
 */
add_shortcode( 'wpappointments', __NAMESPACE__ . '\\render_shortcode' );

/**
 * Register the widget.
 */
add_action( 'widgets_init', __NAMESPACE__ . '\\register_widget' );

/**
 * Render the [wpappointments] shortcode
 *
 * Supported attributes:
 *   flow_type        — one_step|multi_step (default: one_step)
 *   alignment        — left|center|right (default: left)
 *   width            — narrow|full (default: narrow)
 *   trim_unavailable — 1|0 (default: 1)
 *   slots_as_buttons — 1|0 (default: 0)
 *
 * @param array|string $atts Shortcode attributes.
 *
 * @return string HTML output.
 */
function render_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'flow_type'        => 'one_step',
			'alignment'        => 'left',
			'width'            => 'narrow',
			'trim_unavailable' => '1',
			'slots_as_buttons' => '0',
		),
		$atts,
		'wpappointments'
	);

	$attributes = array(
		'flow_type'        => sanitize_text_field( $atts['flow_type'] ),
		'alignment'        => sanitize_text_field( $atts['alignment'] ),
		'width'            => sanitize_text_field( $atts['width'] ),
		'trim_unavailable' => filter_var( $atts['trim_unavailable'], FILTER_VALIDATE_BOOLEAN ),
		'slots_as_buttons' => filter_var( $atts['slots_as_buttons'], FILTER_VALIDATE_BOOLEAN ),
	);

	ob_start();
	wpappointments_render_booking_flow( $attributes );
	return ob_get_clean();
}

/**
 * Register the booking flow widget
 *
 * @return void
 */
function register_widget() {
	\register_widget( __NAMESPACE__ . '\\Booking_Flow_Widget' );
}
