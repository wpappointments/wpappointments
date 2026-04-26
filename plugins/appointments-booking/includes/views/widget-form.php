<?php
/**
 * Widget form template for the Booking Flow widget
 *
 * @package WPAppointments
 * @since 0.5.0
 *
 * @var WP_Widget $widget  Widget instance (provides get_field_id/get_field_name).
 * @var string    $title            Current title value.
 * @var string    $flow_type        Current flow type value.
 * @var string    $alignment        Current alignment value.
 * @var string    $width            Current width value.
 * @var bool      $trim_unavailable Current trim setting.
 * @var bool      $slots_as_buttons Current slots setting.
 */

defined( 'ABSPATH' ) || exit;
?>
<p>
<label for="<?php echo esc_attr( $widget->get_field_id( 'title' ) ); ?>">
<?php esc_html_e( 'Title:', 'appointments-booking' ); ?>
</label>
<input
	class="widefat"
	id="<?php echo esc_attr( $widget->get_field_id( 'title' ) ); ?>"
	name="<?php echo esc_attr( $widget->get_field_name( 'title' ) ); ?>"
	type="text"
	value="<?php echo esc_attr( $title ); ?>"
/>
</p>
<p>
<label for="<?php echo esc_attr( $widget->get_field_id( 'flow_type' ) ); ?>">
<?php esc_html_e( 'Flow type:', 'appointments-booking' ); ?>
</label>
<select
	class="widefat"
	id="<?php echo esc_attr( $widget->get_field_id( 'flow_type' ) ); ?>"
	name="<?php echo esc_attr( $widget->get_field_name( 'flow_type' ) ); ?>"
>
	<option value="one_step" <?php selected( $flow_type, 'one_step' ); ?>>
<?php esc_html_e( 'One Step', 'appointments-booking' ); ?>
	</option>
	<option value="multi_step" <?php selected( $flow_type, 'multi_step' ); ?>>
<?php esc_html_e( 'Multi Step', 'appointments-booking' ); ?>
	</option>
</select>
</p>
<p>
<label for="<?php echo esc_attr( $widget->get_field_id( 'alignment' ) ); ?>">
<?php esc_html_e( 'Alignment:', 'appointments-booking' ); ?>
</label>
<select
	class="widefat"
	id="<?php echo esc_attr( $widget->get_field_id( 'alignment' ) ); ?>"
	name="<?php echo esc_attr( $widget->get_field_name( 'alignment' ) ); ?>"
>
	<option value="left" <?php selected( $alignment, 'left' ); ?>>
<?php esc_html_e( 'Left', 'appointments-booking' ); ?>
	</option>
	<option value="center" <?php selected( $alignment, 'center' ); ?>>
<?php esc_html_e( 'Center', 'appointments-booking' ); ?>
	</option>
	<option value="right" <?php selected( $alignment, 'right' ); ?>>
<?php esc_html_e( 'Right', 'appointments-booking' ); ?>
	</option>
</select>
</p>
<p>
<label for="<?php echo esc_attr( $widget->get_field_id( 'width' ) ); ?>">
<?php esc_html_e( 'Width:', 'appointments-booking' ); ?>
</label>
<select
	class="widefat"
	id="<?php echo esc_attr( $widget->get_field_id( 'width' ) ); ?>"
	name="<?php echo esc_attr( $widget->get_field_name( 'width' ) ); ?>"
>
	<option value="narrow" <?php selected( $width, 'narrow' ); ?>>
<?php esc_html_e( 'Narrow', 'appointments-booking' ); ?>
	</option>
	<option value="full" <?php selected( $width, 'full' ); ?>>
<?php esc_html_e( 'Full', 'appointments-booking' ); ?>
	</option>
</select>
</p>
<p>
<input
	type="checkbox"
	id="<?php echo esc_attr( $widget->get_field_id( 'trim_unavailable' ) ); ?>"
	name="<?php echo esc_attr( $widget->get_field_name( 'trim_unavailable' ) ); ?>"
	value="1"
<?php checked( $trim_unavailable ); ?>
/>
<label for="<?php echo esc_attr( $widget->get_field_id( 'trim_unavailable' ) ); ?>">
<?php esc_html_e( 'Trim unavailable slots', 'appointments-booking' ); ?>
</label>
</p>
<p>
<input
	type="checkbox"
	id="<?php echo esc_attr( $widget->get_field_id( 'slots_as_buttons' ) ); ?>"
	name="<?php echo esc_attr( $widget->get_field_name( 'slots_as_buttons' ) ); ?>"
	value="1"
<?php checked( $slots_as_buttons ); ?>
/>
<label for="<?php echo esc_attr( $widget->get_field_id( 'slots_as_buttons' ) ); ?>">
<?php esc_html_e( 'Show time slots as buttons', 'appointments-booking' ); ?>
</label>
</p>
