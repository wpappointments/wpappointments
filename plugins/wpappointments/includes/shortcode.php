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

use WPAppointments\Core\PluginInfo;

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
 * Render the booking flow HTML and enqueue required assets
 *
 * Shared by the shortcode, widget, and template function.
 *
 * @param array $attributes Booking flow attributes (camelCase keys).
 *
 * @return string HTML output.
 */
function render_booking_flow_html( $attributes ) {
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

/**
 * Register the booking flow widget
 *
 * @return void
 */
function register_widget() {
	\register_widget( __NAMESPACE__ . '\\Booking_Flow_Widget' );
}
