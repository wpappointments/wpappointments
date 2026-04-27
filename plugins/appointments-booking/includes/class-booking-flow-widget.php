<?php
/**
 * Booking Flow widget for classic themes
 *
 * @package WPAppointments
 * @since 0.5.0
 */

namespace WPAppointments\Shortcode;

defined( 'ABSPATH' ) || exit;

/**
 * Booking Flow widget for classic themes
 */
class Booking_Flow_Widget extends \WP_Widget {

	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct(
			'wpappointments_booking_flow',
			__( 'WP Appointments Booking Flow', 'appointments-booking' ),
			array(
				'description' => __( 'Display the appointment booking flow.', 'appointments-booking' ),
			)
		);
	}

	/**
	 * Output the widget content
	 *
	 * @param array $args     Widget display arguments.
	 * @param array $instance Widget settings.
	 *
	 * @return void
	 */
	public function widget( $args, $instance ) {
		$attributes = array(
			'flow_type'        => $instance['flow_type'] ?? 'one_step',
			'alignment'        => $instance['alignment'] ?? 'left',
			'width'            => $instance['width'] ?? 'narrow',
			'trim_unavailable' => ! empty( $instance['trim_unavailable'] ),
			'slots_as_buttons' => ! empty( $instance['slots_as_buttons'] ),
		);

		echo wp_kses_post( $args['before_widget'] );

		if ( ! empty( $instance['title'] ) ) {
			echo wp_kses_post( $args['before_title'] . esc_html( $instance['title'] ) . $args['after_title'] );
		}

		wpappointments_render_booking_flow( $attributes );

		echo wp_kses_post( $args['after_widget'] );
	}

	/**
	 * Output the widget settings form
	 *
	 * @param array $instance Current settings.
	 *
	 * @return void
	 */
	public function form( $instance ) {
		$widget           = $this;
		$title            = $instance['title'] ?? '';
		$flow_type        = $instance['flow_type'] ?? 'one_step';
		$alignment        = $instance['alignment'] ?? 'left';
		$width            = $instance['width'] ?? 'narrow';
		$trim_unavailable = ! empty( $instance['trim_unavailable'] );
		$slots_as_buttons = ! empty( $instance['slots_as_buttons'] );

		require __DIR__ . '/views/widget-form.php';
	}

	/**
	 * Update widget settings
	 *
	 * @param array $new_instance New settings.
	 * @param array $old_instance Old settings.
	 *
	 * @return array Updated settings.
	 */
	public function update( $new_instance, $old_instance ) {
		return array(
			'title'            => sanitize_text_field( $new_instance['title'] ?? '' ),
			'flow_type'        => sanitize_text_field( $new_instance['flow_type'] ?? 'one_step' ),
			'alignment'        => sanitize_text_field( $new_instance['alignment'] ?? 'left' ),
			'width'            => sanitize_text_field( $new_instance['width'] ?? 'narrow' ),
			'trim_unavailable' => ! empty( $new_instance['trim_unavailable'] ),
			'slots_as_buttons' => ! empty( $new_instance['slots_as_buttons'] ),
		);
	}
}
