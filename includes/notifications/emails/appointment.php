<?php
/**
 * Email template for appointment created
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Notifications\Emails;

defined( 'ABSPATH' ) || exit;

/**
 * Email template for appointment created
 *
 * @param \WPAppointments\Appointment $appointment Appointment object.
 *
 * @return void
 */
function send_new_appointment_email( $appointment ) {
	ob_start();
	require_once WPAPPOINTMENTS_PLUGIN_DIR_PATH . 'includes/notifications/emails/html/appointment-created.html';
	$content = ob_get_clean();

	wp_mail(
		$appointment->customer->email,
		sprintf(
			/* translators: %1$s: Date, %2$s: Time */
			__( 'Appointment Confirmation: %1$s at %2$s', 'wpappointments' ),
			wp_date( 'F j, Y', $appointment->timestamp ),
			wp_date( 'g:i a', $appointment->timestamp )
		),
		evaluate_merge_tag( $content, $appointment )
	);
}

add_action(
	'wpappointments_appointment_created',
	__NAMESPACE__ . '\\send_new_appointment_email',
	10,
	1
);

/**
 * Email template for appointment updated
 *
 * @param \WPAppointments\Appointment $new_appointment     New appointment object.
 * @param \WPAppointments\Appointment $previous_appointment Previous appointment object.
 *
 * @return void
 */
function send_updated_appointment_email( $new_appointment, $previous_appointment ) {
	ob_start();
	require_once WPAPPOINTMENTS_PLUGIN_DIR_PATH . 'includes/notifications/emails/html/appointment-updated.html';
	$content = ob_get_clean();

	wp_mail(
		$new_appointment->customer->email,
		sprintf(
			/* translators: %1$s: Date, %2$s: Time */
			__( 'Appointment Updated: %1$s at %2$s', 'wpappointments' ),
			wp_date( 'F j, Y', $new_appointment->timestamp ),
			wp_date( 'g:i a', $new_appointment->timestamp )
		),
		evaluate_merge_tag( $content, $new_appointment, $previous_appointment )
	);
}

add_action(
	'wpappointments_appointment_updated',
	__NAMESPACE__ . '\\send_updated_appointment_email',
	10,
	2
);

/**
 * Email template for appointment cancelled
 *
 * @param \WPAppointments\Appointment $appointment Appointment object.
 *
 * @return void
 */
function send_cancelled_appointment_email( $appointment ) {
  ob_start();
  require_once WPAPPOINTMENTS_PLUGIN_DIR_PATH . 'includes/notifications/emails/html/appointment-cancelled.html';
  $content = ob_get_clean();

  wp_mail(
    $appointment->customer->email,
    sprintf(
      /* translators: %1$s: Date, %2$s: Time */
      __( 'Appointment Cancelled: %1$s at %2$s', 'wpappointments' ),
      wp_date( 'F j, Y', $appointment->timestamp ),
      wp_date( 'g:i a', $appointment->timestamp )
    ),
    evaluate_merge_tag( $content, $appointment )
  );
}

add_action(
  'wpappointments_appointment_cancelled',
  __NAMESPACE__ . '\\send_cancelled_appointment_email',
  10,
  1
);

/**
 * Email template for appointment confirmed
 *
 * @param string                           $content Email content.
 * @param \WPAppointments\Appointment      $appointment Appointment object.
 *
 * @return string
 */
function send_confirmed_appointment_email( $content, $appointment ) {
  ob_start();
  require_once WPAPPOINTMENTS_PLUGIN_DIR_PATH . 'includes/notifications/emails/html/appointment-confirmed.html';
  $content = ob_get_clean();

  wp_mail(
    $appointment->customer->email,
    sprintf(
      /* translators: %1$s: Date, %2$s: Time */
      __( 'Appointment Confirmed: %1$s at %2$s', 'wpappointments' ),
      wp_date( 'F j, Y', $appointment->timestamp ),
      wp_date( 'g:i a', $appointment->timestamp )
    ),
    evaluate_merge_tag( $content, $appointment )
  );
}

add_action(
  'wpappointments_appointment_confirmed',
  __NAMESPACE__ . '\\send_confirmed_appointment_email',
  10,
  2
);

/**
 * Email template for appointment no-show
 *
 * @param string                           $content Email content.
 * @param \WPAppointments\Appointment      $appointment Appointment object.
 *
 * @return string
 */
function send_no_show_appointment_email( $content, $appointment ) {
  ob_start();
  require_once WPAPPOINTMENTS_PLUGIN_DIR_PATH . 'includes/notifications/emails/html/appointment-no-show.html';
  $content = ob_get_clean();

  wp_mail(
    $appointment->customer->email,
    sprintf(
      /* translators: %1$s: Date, %2$s: Time */
      __( 'Appointment No-Show: %1$s at %2$s', 'wpappointments' ),
      wp_date( 'F j, Y', $appointment->timestamp ),
      wp_date( 'g:i a', $appointment->timestamp )
    ),
    evaluate_merge_tag( $content, $appointment )
  );
}

add_action(
  'wpappointments_appointment_no_show',
  __NAMESPACE__ . '\\send_no_show_appointment_email',
  10,
  2
);

/**
 * Email template for appointment cancelled
 *
 * @param string                           $content Email content.
 * @param \WPAppointments\Appointment      $new_appointment Appointment object.
 * @param \WPAppointments\Appointment|null $previous_appointment Previous appointment object.
 *
 * @return string
 */
function evaluate_merge_tag( $content, $new_appointment, $previous_appointment = null ) {
	$tags = array(
		'{customer_name}'    => $new_appointment->customer->name,
		'{previous_date}'    => $previous_appointment ? wp_date( 'F j, Y', $previous_appointment->timestamp ) : '',
		'{previous_time}'    => $previous_appointment ? wp_date( 'g:i a', $previous_appointment->timestamp ) : '',
		'{date}'             => wp_date( 'F j, Y', $new_appointment->timestamp ),
		'{time}'             => wp_date( 'g:i a', $new_appointment->timestamp ),
		'{admin_first_name}' => get_option( 'wpappointments_general_firstName' ),
		'{admin_last_name}'  => get_option( 'wpappointments_general_lastName' ),
		'{admin_email}'      => get_option( 'wpappointments_general_email' ),
		'{admin_phone}'      => get_option( 'wpappointments_general_phone' ),
	);

	return str_replace( array_keys( $tags ), array_values( $tags ), $content );
}
