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
			'flowType'        => $instance['flow_type'] ?? 'OneStep',
			'alignment'       => $instance['alignment'] ?? 'Left',
			'width'           => $instance['width'] ?? 'Narrow',
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
		$title     = $instance['title'] ?? '';
		$flow_type = $instance['flow_type'] ?? 'OneStep';
		$alignment = $instance['alignment'] ?? 'Left';
		$width     = $instance['width'] ?? 'Narrow';
		?>
		<p>
		<label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>">
		<?php esc_html_e( 'Title:', 'wpappointments' ); ?>
		</label>
		<input
			class="widefat"
			id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"
			name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>"
			type="text"
			value="<?php echo esc_attr( $title ); ?>"
		/>
		</p>
		<p>
		<label for="<?php echo esc_attr( $this->get_field_id( 'flow_type' ) ); ?>">
		<?php esc_html_e( 'Flow type:', 'wpappointments' ); ?>
		</label>
		<select
			class="widefat"
			id="<?php echo esc_attr( $this->get_field_id( 'flow_type' ) ); ?>"
			name="<?php echo esc_attr( $this->get_field_name( 'flow_type' ) ); ?>"
		>
			<option value="OneStep" <?php selected( $flow_type, 'OneStep' ); ?>>
		<?php esc_html_e( 'One Step', 'wpappointments' ); ?>
			</option>
			<option value="MultiStep" <?php selected( $flow_type, 'MultiStep' ); ?>>
		<?php esc_html_e( 'Multi Step', 'wpappointments' ); ?>
			</option>
		</select>
		</p>
		<p>
		<label for="<?php echo esc_attr( $this->get_field_id( 'alignment' ) ); ?>">
		<?php esc_html_e( 'Alignment:', 'wpappointments' ); ?>
		</label>
		<select
			class="widefat"
			id="<?php echo esc_attr( $this->get_field_id( 'alignment' ) ); ?>"
			name="<?php echo esc_attr( $this->get_field_name( 'alignment' ) ); ?>"
		>
			<option value="Left" <?php selected( $alignment, 'Left' ); ?>>
		<?php esc_html_e( 'Left', 'wpappointments' ); ?>
			</option>
			<option value="Center" <?php selected( $alignment, 'Center' ); ?>>
		<?php esc_html_e( 'Center', 'wpappointments' ); ?>
			</option>
			<option value="Right" <?php selected( $alignment, 'Right' ); ?>>
		<?php esc_html_e( 'Right', 'wpappointments' ); ?>
			</option>
		</select>
		</p>
		<p>
		<label for="<?php echo esc_attr( $this->get_field_id( 'width' ) ); ?>">
		<?php esc_html_e( 'Width:', 'wpappointments' ); ?>
		</label>
		<select
			class="widefat"
			id="<?php echo esc_attr( $this->get_field_id( 'width' ) ); ?>"
			name="<?php echo esc_attr( $this->get_field_name( 'width' ) ); ?>"
		>
			<option value="Narrow" <?php selected( $width, 'Narrow' ); ?>>
		<?php esc_html_e( 'Narrow', 'wpappointments' ); ?>
			</option>
			<option value="Full" <?php selected( $width, 'Full' ); ?>>
		<?php esc_html_e( 'Full', 'wpappointments' ); ?>
			</option>
		</select>
		</p>
		<?php
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
			'flow_type'        => sanitize_text_field( $new_instance['flow_type'] ?? 'OneStep' ),
			'alignment'        => sanitize_text_field( $new_instance['alignment'] ?? 'Left' ),
			'width'            => sanitize_text_field( $new_instance['width'] ?? 'Narrow' ),
			'trim_unavailable' => ! empty( $new_instance['trim_unavailable'] ),
			'slots_as_buttons' => ! empty( $new_instance['slots_as_buttons'] ),
		);
	}
}
