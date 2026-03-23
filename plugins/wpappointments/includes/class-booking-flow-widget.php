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
	 * Map snake_case widget values to camelCase JS attribute values.
	 *
	 * @var array
	 */
	private static $value_map = array(
		'flow_type' => array(
			'one_step'   => 'OneStep',
			'multi_step' => 'MultiStep',
		),
		'alignment' => array(
			'left'   => 'Left',
			'center' => 'Center',
			'right'  => 'Right',
		),
		'width'     => array(
			'narrow' => 'Narrow',
			'full'   => 'Full',
		),
	);

	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct(
			'wpappointments_booking_flow',
			__( 'WP Appointments Booking Flow', 'wpappointments' ),
			array(
				'description' => __( 'Display the appointment booking flow.', 'wpappointments' ),
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
			'flowType'        => self::$value_map['flow_type'][ $instance['flow_type'] ?? 'one_step' ] ?? 'OneStep',
			'alignment'       => self::$value_map['alignment'][ $instance['alignment'] ?? 'left' ] ?? 'Left',
			'width'           => self::$value_map['width'][ $instance['width'] ?? 'narrow' ] ?? 'Narrow',
			'trimUnavailable' => ! empty( $instance['trim_unavailable'] ),
			'slotsAsButtons'  => ! empty( $instance['slots_as_buttons'] ),
		);

		echo wp_kses_post( $args['before_widget'] );

		if ( ! empty( $instance['title'] ) ) {
			echo wp_kses_post( $args['before_title'] . esc_html( $instance['title'] ) . $args['after_title'] );
		}

		echo wp_kses(
			render_booking_flow_html( $attributes ),
			array(
				'div' => array(
					'class'           => array(),
					'data-attributes' => array(),
				),
			)
		);

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
