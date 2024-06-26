<?php
/**
 * Email template for appointment created
 *
 * @package WPAppointments
 * @since 0.0.1
 */

use WPAppointments\Core\PluginInfo;
use WPAppointments\Data\Model\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Send email notification to the site admin when an appointment is created
 *
 * @param \WPAppointments\Appointment $appointment Appointment object.
 *
 * @return void
 */
function send_appointment_created_admin_email( $appointment ) {
	$settings    = new Settings();
	$content     = get_template_content( 'appointment-created-admin' );
	$formats     = get_date_formats();
	$admin_email = $settings->get_setting( 'general', 'email' );

	wp_mail(
		$admin_email,
		sprintf(
		/* translators: %1$s: Date, %2$s: Time */
			__( 'Appointment Confirmation: %1$s at %2$s', 'wpappointments' ),
			wp_date( $formats['date'], $appointment['timestamp'] ),
			wp_date( $formats['time'], $appointment['timestamp'] )
		),
		evaluate_merge_tag( $content, $appointment )
	);
}

add_action(
	'wpappointments_appointment_created',
	__NAMESPACE__ . '\\send_appointment_created_admin_email',
	10,
	1
);

/**
 * Send email notification to the customer when an appointment is created
 *
 * @param \WPAppointments\Appointment $appointment Appointment object.
 *
 * @return void
 */
function send_appointment_created_customer_email( $appointment ) {
	$content  = get_template_content( 'appointment-created-customer' );
	$formats  = get_date_formats();
	$customer = maybe_unserialize( $appointment['customer'] );

	if ( ! isset( $customer['email'] ) ) {
		return;
	}

	wp_mail(
		$customer['email'],
		sprintf(
		/* translators: %1$s: Date, %2$s: Time */
			__( 'Appointment Confirmation: %1$s at %2$s', 'wpappointments' ),
			wp_date( $formats['date'], $appointment['timestamp'] ),
			wp_date( $formats['time'], $appointment['timestamp'] )
		),
		evaluate_merge_tag( $content, $appointment )
	);
}

add_action(
	'wpappointments_appointment_created',
	__NAMESPACE__ . '\\send_appointment_created_customer_email',
	10,
	1
);


/**
 * Email template for appointment updated
 *
 * @param \WPAppointments\Appointment $new_appointment New appointment object.
 * @param \WPAppointments\Appointment $previous_appointment Previous appointment object.
 *
 * @return void
 */
function send_appointment_updated_admin_email( $new_appointment, $previous_appointment ) {
	$content     = get_template_content( 'appointment-updated-admin' );
	$formats     = get_date_formats();
	$settings    = new Settings();
	$admin_email = $settings->get_setting( 'general', 'email' );

	wp_mail(
		$admin_email,
		sprintf(
		/* translators: %1$s: Date, %2$s: Time */
			__( 'Appointment Updated: %1$s at %2$s', 'wpappointments' ),
			wp_date( $formats['date'], $new_appointment['timestamp'] ),
			wp_date( $formats['time'], $new_appointment['timestamp'] )
		),
		evaluate_merge_tag( $content, $new_appointment, $previous_appointment )
	);
}

add_action(
	'wpappointments_appointment_updated',
	__NAMESPACE__ . '\\send_appointment_updated_admin_email',
	10,
	2
);

/**
 * Email template for appointment updated
 *
 * @param \WPAppointments\Appointment $new_appointment New appointment object.
 * @param \WPAppointments\Appointment $previous_appointment Previous appointment object.
 *
 * @return void
 */
function send_appointment_updated_customer_email( $new_appointment, $previous_appointment ) {
	$content  = get_template_content( 'appointment-updated-customer' );
	$formats  = get_date_formats();
	$customer = maybe_unserialize( $new_appointment['customer'] );

	if ( ! isset( $customer['email'] ) ) {
		return;
	}

	wp_mail(
		$customer['email'],
		sprintf(
		/* translators: %1$s: Date, %2$s: Time */
			__( 'Appointment Updated: %1$s at %2$s', 'wpappointments' ),
			wp_date( $formats['date'], $new_appointment['timestamp'] ),
			wp_date( $formats['time'], $new_appointment['timestamp'] )
		),
		evaluate_merge_tag( $content, $new_appointment, $previous_appointment )
	);
}

add_action(
	'wpappointments_appointment_updated',
	__NAMESPACE__ . '\\send_appointment_updated_customer_email',
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
function send_appointment_cancelled_admin_email( $appointment ) {
	$content     = get_template_content( 'appointment-cancelled-admin' );
	$formats     = get_date_formats();
	$settings    = new Settings();
	$admin_email = $settings->get_setting( 'general', 'email' );

	wp_mail(
		$admin_email,
		sprintf(
		/* translators: %1$s: Date, %2$s: Time */
			__( 'Appointment Cancelled: %1$s at %2$s', 'wpappointments' ),
			wp_date( $formats['date'], $appointment['timestamp'] ),
			wp_date( $formats['time'], $appointment['timestamp'] )
		),
		evaluate_merge_tag( $content, $appointment )
	);
}

add_action(
	'wpappointments_appointment_cancelled',
	__NAMESPACE__ . '\\send_appointment_cancelled_admin_email',
	10,
	1
);

/**
 * Email template for appointment cancelled
 *
 * @param \WPAppointments\Appointment $appointment Appointment object.
 *
 * @return void
 */
function send_appointment_cancelled_customer_email( $appointment ) {
	$content  = get_template_content( 'appointment-cancelled-customer' );
	$formats  = get_date_formats();
	$customer = maybe_unserialize( $appointment['customer'] );

	if ( ! isset( $customer['email'] ) ) {
		return;
	}

	wp_mail(
		$customer['email'],
		sprintf(
		/* translators: %1$s: Date, %2$s: Time */
			__( 'Appointment Cancelled: %1$s at %2$s', 'wpappointments' ),
			wp_date( $formats['date'], $appointment['timestamp'] ),
			wp_date( $formats['time'], $appointment['timestamp'] )
		),
		evaluate_merge_tag( $content, $appointment )
	);
}

add_action(
	'wpappointments_appointment_cancelled',
	__NAMESPACE__ . '\\send_appointment_cancelled_customer_email',
	10,
	1
);

/**
 * Email template for appointment confirmed
 *
 * @param \WPAppointments\Appointment $appointment Appointment object.
 *
 * @return void
 */
function send_appointment_confirmed_admin_email( $appointment ) {
	$content     = get_template_content( 'appointment-confirmed-admin' );
	$formats     = get_date_formats();
	$settings    = new Settings();
	$admin_email = $settings->get_setting( 'general', 'email' );

	wp_mail(
		$admin_email,
		sprintf(
		/* translators: %1$s: Date, %2$s: Time */
			__( 'Appointment Confirmed: %1$s at %2$s', 'wpappointments' ),
			wp_date( $formats['date'], $appointment['timestamp'] ),
			wp_date( $formats['time'], $appointment['timestamp'] )
		),
		evaluate_merge_tag( $content, $appointment )
	);
}

add_action(
	'wpappointments_appointment_confirmed',
	__NAMESPACE__ . '\\send_appointment_confirmed_admin_email',
	10,
	1
);

/**
 * Email template for appointment confirmed
 *
 * @param \WPAppointments\Appointment $appointment Appointment object.
 *
 * @return void
 */
function send_appointment_confirmed_customer_email( $appointment ) {
	$content  = get_template_content( 'appointment-confirmed-customer' );
	$formats  = get_date_formats();
	$customer = maybe_unserialize( $appointment['customer'] );

	if ( ! isset( $customer['email'] ) ) {
		return;
	}

	wp_mail(
		$customer['email'],
		sprintf(
		/* translators: %1$s: Date, %2$s: Time */
			__( 'Appointment Confirmed: %1$s at %2$s', 'wpappointments' ),
			wp_date( $formats['date'], $appointment['timestamp'] ),
			wp_date( $formats['time'], $appointment['timestamp'] )
		),
		evaluate_merge_tag( $content, $appointment )
	);
}

add_action(
	'wpappointments_appointment_confirmed',
	__NAMESPACE__ . '\\send_appointment_confirmed_customer_email',
	10,
	1
);

/**
 * Email template for appointment no-show
 *
 * @param string                      $content Email content.
 * @param \WPAppointments\Appointment $appointment Appointment object.
 *
 * @return void
 */
function send_appointment_noshow_admin_email( $content, $appointment ) {
	$content     = get_template_content( 'appointment-no-show-admin' );
	$formats     = get_date_formats();
	$settings    = new Settings();
	$admin_email = $settings->get_setting( 'general', 'email' );

	wp_mail(
		$admin_email,
		sprintf(
		/* translators: %1$s: Date, %2$s: Time */
			__( 'Appointment No-Show: %1$s at %2$s', 'wpappointments' ),
			wp_date( $formats['date'], $appointment['timestamp'] ),
			wp_date( $formats['time'], $appointment['timestamp'] )
		),
		evaluate_merge_tag( $content, $appointment )
	);
}

add_action(
	'wpappointments_appointment_noshow',
	__NAMESPACE__ . '\\send_appointment_noshow_admin_email',
	10,
	2
);

/**
 * Email template for appointment no-show
 *
 * @param string                      $content Email content.
 * @param \WPAppointments\Appointment $appointment Appointment object.
 *
 * @return void
 */
function send_appointment_noshow_email( $content, $appointment ) {
	$content  = get_template_content( 'appointment-no-show-customer' );
	$formats  = get_date_formats();
	$customer = maybe_unserialize( $appointment['customer'] );

	if ( ! isset( $customer['email'] ) ) {
		return;
	}

	wp_mail(
		$customer['email'],
		sprintf(
		/* translators: %1$s: Date, %2$s: Time */
			__( 'Appointment No-Show: %1$s at %2$s', 'wpappointments' ),
			wp_date( $formats['date'], $appointment['timestamp'] ),
			wp_date( $formats['time'], $appointment['timestamp'] )
		),
		evaluate_merge_tag( $content, $appointment )
	);
}

add_action(
	'wpappointments_appointment_noshow',
	__NAMESPACE__ . '\\send_appointment_noshow_email',
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
	$formats  = get_date_formats();
	$settings = new Settings();
	$customer = maybe_unserialize( $new_appointment['customer'] );

	$tags = array(
		'{customer_name}'    => $customer['name'],
		'{previous_date}'    => $previous_appointment ? wp_date( $formats['date'], $previous_appointment['timestamp'] ) : '',
		'{previous_time}'    => $previous_appointment ? wp_date( $formats['time'], $previous_appointment['timestamp'] ) : '',
		'{date}'             => wp_date( $formats['date'], $new_appointment['timestamp'] ),
		'{time}'             => wp_date( $formats['time'], $new_appointment['timestamp'] ),
		'{previous_status}'  => $previous_appointment ? strtoupper( $previous_appointment['status'] ) : '',
		'{status}'           => strtoupper( $new_appointment['status'] ),
		'{admin_first_name}' => $settings->get_setting( 'general', 'firstName' ),
		'{admin_last_name}'  => $settings->get_setting( 'general', 'lastName' ),
		'{admin_email}'      => $settings->get_setting( 'general', 'email' ),
		'{admin_phone}'      => $settings->get_setting( 'general', 'phoneNumber' ),
	);

	return str_replace( array_keys( $tags ), array_values( $tags ), $content );
}

/**
 * Get the content of the email template
 *
 * @param string $template_name Name of the template.
 *
 * @return string
 */
function get_template_content( $template_name ): string {
	ob_start();

	require_once PluginInfo::get_plugin_dir_path() . 'includes/notifications/emails/html/' . $template_name . '.html';

	return ob_get_clean();
}
