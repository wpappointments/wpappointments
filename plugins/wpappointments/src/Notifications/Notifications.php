<?php
/**
 * Notifications class file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Notifications;

use WPAppointments\Core\Singleton;

/**
 * Handles email notifications for appointment lifecycle events
 */
class Notifications extends Singleton {
	/**
	 * Default subjects per event
	 *
	 * @var array
	 */
	private static $default_subjects = array(
		'created'   => 'New appointment booked',
		'updated'   => 'Appointment updated',
		'confirmed' => 'Appointment confirmed',
		'cancelled' => 'Appointment cancelled',
	);

	/**
	 * Default customer-facing subjects per event
	 *
	 * @var array
	 */
	private static $default_customer_subjects = array(
		'created'   => 'Your appointment has been booked',
		'updated'   => 'Your appointment has been updated',
		'confirmed' => 'Your appointment is confirmed',
		'cancelled' => 'Your appointment has been cancelled',
	);

	/**
	 * Register notification hooks
	 */
	public function __construct() {
		add_action( 'wpappointments_appointment_created', array( $this, 'on_created' ) );
		add_action( 'wpappointments_appointment_updated', array( $this, 'on_updated' ) );
		add_action( 'wpappointments_appointment_confirmed', array( $this, 'on_confirmed' ) );
		add_action( 'wpappointments_appointment_cancelled', array( $this, 'on_cancelled' ) );
	}

	/**
	 * Send notification when appointment is created
	 *
	 * @param array $appointment Normalized appointment data.
	 *
	 * @return void
	 */
	public function on_created( $appointment ) {
		$this->dispatch( 'created', $appointment, __( 'A new appointment has been booked.', 'wpappointments' ) );
	}

	/**
	 * Send notification when appointment is updated
	 *
	 * @param array $appointment Updated appointment data.
	 *
	 * @return void
	 */
	public function on_updated( $appointment ) {
		$this->dispatch( 'updated', $appointment, __( 'An appointment has been updated.', 'wpappointments' ) );
	}

	/**
	 * Send notification when appointment is confirmed
	 *
	 * @param array $appointment Confirmed appointment data.
	 *
	 * @return void
	 */
	public function on_confirmed( $appointment ) {
		$this->dispatch( 'confirmed', $appointment, __( 'An appointment has been confirmed.', 'wpappointments' ) );
	}

	/**
	 * Send notification when appointment is cancelled
	 *
	 * @param array $appointment Cancelled appointment data.
	 *
	 * @return void
	 */
	public function on_cancelled( $appointment ) {
		$this->dispatch( 'cancelled', $appointment, __( 'An appointment has been cancelled.', 'wpappointments' ) );
	}

	/**
	 * Dispatch notifications for a given event, respecting user settings
	 *
	 * @param string $event       Event key (created|updated|confirmed|cancelled).
	 * @param array  $appointment Normalized appointment data.
	 * @param string $intro       Default intro sentence for the email body.
	 *
	 * @return void
	 */
	private function dispatch( $event, $appointment, $intro ) {
		$config = $this->get_event_config( $event );

		if ( ! $config['enabled'] ) {
			return;
		}

		$body = $config['body'] ? $this->interpolate( $config['body'], $appointment ) : $this->build_message( $appointment, $intro );

		if ( $config['sendToAdmin'] ) {
			$subject = $config['subject'] ? $config['subject'] : self::$default_subjects[ $event ];
			$this->send_to_admin( $subject, $body );
		}

		if ( $config['sendToCustomer'] ) {
			$subject = $config['subject'] ? $config['subject'] : self::$default_customer_subjects[ $event ];
			$this->send_to_customer( $appointment, $subject, $body );
		}

		$custom_recipients = array_filter( array_map( 'trim', explode( ',', $config['customRecipients'] ) ) );

		foreach ( $custom_recipients as $recipient ) {
			if ( is_email( $recipient ) ) {
				$subject = $config['subject'] ? $config['subject'] : self::$default_subjects[ $event ];
				$this->send( $recipient, $subject, $body );
			}
		}
	}

	/**
	 * Get notification config for a specific event, with defaults
	 *
	 * @param string $event Event key.
	 *
	 * @return array
	 */
	private function get_event_config( $event ) {
		$stored = get_option( 'wpappointments_notifications_' . $event, array() );

		$defaults = array(
			'enabled'          => true,
			'sendToAdmin'      => true,
			'sendToCustomer'   => true,
			'customRecipients' => '',
			'subject'          => '',
			'body'             => '',
		);

		if ( ! is_array( $stored ) ) {
			return $defaults;
		}

		return array_merge( $defaults, $stored );
	}

	/**
	 * Replace template variables in a string with appointment data
	 *
	 * Supported variables: {service}, {status}, {date}, {duration}, {customer_name}, {id}
	 *
	 * @param string $template    Template string with {variable} placeholders.
	 * @param array  $appointment Normalized appointment data.
	 *
	 * @return string Interpolated string.
	 */
	private function interpolate( $template, $appointment ) {
		$date_format = get_option( 'wpappointments_general_dateFormat' );
		$time_format = get_option( 'wpappointments_general_timeFormat' );
		$date_format = $date_format ? $date_format : 'd/m/Y';
		$time_format = $time_format ? $time_format : 'H:i';

		$timestamp = absint( $appointment['timestamp'] ?? 0 );
		$date_time = $timestamp ? wp_date( $date_format . ' ' . $time_format, $timestamp ) : '—';

		$replacements = array(
			'{id}'            => absint( $appointment['id'] ?? 0 ),
			'{service}'       => $appointment['service'] ?? '',
			'{status}'        => ucfirst( $appointment['status'] ?? '' ),
			'{date}'          => $date_time,
			'{duration}'      => absint( $appointment['duration'] ?? 0 ),
			'{customer_name}' => $this->get_customer_name( $appointment ),
		);

		return str_replace( array_keys( $replacements ), array_values( $replacements ), $template );
	}

	/**
	 * Send email to admin
	 *
	 * @param string $subject Email subject.
	 * @param string $message Email message (HTML).
	 *
	 * @return void
	 */
	private function send_to_admin( $subject, $message ) {
		$plugin_email = get_option( 'wpappointments_general_email' );
		$admin_email  = $plugin_email ? $plugin_email : get_option( 'admin_email' );

		if ( ! $admin_email ) {
			return;
		}

		$this->send( $admin_email, $subject, $message );
	}

	/**
	 * Send email to customer
	 *
	 * @param array  $appointment Appointment data.
	 * @param string $subject     Email subject.
	 * @param string $message     Email message (HTML).
	 *
	 * @return void
	 */
	private function send_to_customer( $appointment, $subject, $message ) {
		$customer_email = $this->get_customer_email( $appointment );

		if ( ! $customer_email ) {
			return;
		}

		$this->send( $customer_email, $subject, $message );
	}

	/**
	 * Send email using wp_mail
	 *
	 * @param string $to      Recipient email.
	 * @param string $subject Email subject.
	 * @param string $message Email message (HTML).
	 *
	 * @return void
	 */
	private function send( $to, $subject, $message ) {
		$site_name = wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );
		$headers   = array( 'Content-Type: text/html; charset=UTF-8' );

		/**
		 * Filters the email headers for WP Appointments notifications.
		 *
		 * @param array  $headers Email headers.
		 * @param string $to      Recipient email.
		 * @param string $subject Email subject.
		 */
		$headers = apply_filters( 'wpappointments_notification_headers', $headers, $to, $subject );

		/**
		 * Filters the full email subject for WP Appointments notifications.
		 *
		 * @param string $full_subject Full subject with site name prefix.
		 * @param string $subject      Original subject.
		 */
		$full_subject = apply_filters(
			'wpappointments_notification_subject',
			sprintf( '[%s] %s', $site_name, $subject ),
			$subject
		);

		wp_mail( $to, $full_subject, $message, $headers );
	}

	/**
	 * Build a plain HTML email body for an appointment event
	 *
	 * @param array  $appointment Normalized appointment data.
	 * @param string $intro       Introductory sentence describing the event.
	 *
	 * @return string HTML email body.
	 */
	private function build_message( $appointment, $intro ) {
		$service        = esc_html( $appointment['service'] ?? '' );
		$status         = esc_html( ucfirst( $appointment['status'] ?? '' ) );
		$appointment_id = absint( $appointment['id'] ?? 0 );
		$customer_name  = esc_html( $this->get_customer_name( $appointment ) );

		$date_format     = get_option( 'wpappointments_general_dateFormat' );
		$time_format     = get_option( 'wpappointments_general_timeFormat' );
		$date_format     = $date_format ? $date_format : 'd/m/Y';
		$time_format     = $time_format ? $time_format : 'H:i';
		$raw_date_format = $date_format;
		$raw_time_format = $time_format;
		$date_format     = $raw_date_format ? $raw_date_format : 'd/m/Y';
		$time_format     = $raw_time_format ? $raw_time_format : 'H:i';

		$timestamp = absint( $appointment['timestamp'] ?? 0 );
		$date_time = $timestamp ? wp_date( $date_format . ' ' . $time_format, $timestamp ) : '—';

		$duration  = absint( $appointment['duration'] ?? 0 );
		$site_name = esc_html( get_bloginfo( 'name' ) );

		$message  = '<html><body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;">';
		$message .= '<h2 style="color:#174aff;">' . esc_html( $site_name ) . '</h2>';
		$message .= '<p>' . esc_html( $intro ) . '</p>';
		$message .= '<table style="border-collapse:collapse;width:100%;">';
		$message .= $this->table_row( __( 'Appointment ID', 'wpappointments' ), '#' . $appointment_id );
		$message .= $this->table_row( __( 'Service', 'wpappointments' ), $service );
		$message .= $this->table_row( __( 'Date & Time', 'wpappointments' ), $date_time );

		if ( $duration ) {
			$message .= $this->table_row( __( 'Duration', 'wpappointments' ), $duration . ' ' . __( 'minutes', 'wpappointments' ) );
		}

		if ( $customer_name ) {
			$message .= $this->table_row( __( 'Customer', 'wpappointments' ), $customer_name );
		}

		$message .= $this->table_row( __( 'Status', 'wpappointments' ), $status );
		$message .= '</table>';
		$message .= '</body></html>';

		/**
		 * Filters the email message body for WP Appointments notifications.
		 *
		 * @param string $message     HTML email body.
		 * @param array  $appointment Normalized appointment data.
		 * @param string $intro       Introductory sentence.
		 */
		return apply_filters( 'wpappointments_notification_message', $message, $appointment, $intro );
	}

	/**
	 * Build a single table row for the email template
	 *
	 * @param string $label Table cell label.
	 * @param string $value Table cell value.
	 *
	 * @return string HTML table row.
	 */
	private function table_row( $label, $value ) {
		return '<tr>'
		. '<td style="padding:8px;border:1px solid #ddd;font-weight:bold;width:40%;">' . esc_html( $label ) . '</td>'
		. '<td style="padding:8px;border:1px solid #ddd;">' . esc_html( $value ) . '</td>'
		. '</tr>';
	}

	/**
	 * Extract customer email from appointment data
	 *
	 * @param array $appointment Normalized appointment data.
	 *
	 * @return string|null Customer email address or null if not found.
	 */
	private function get_customer_email( $appointment ) {
		$customer = $appointment['customer'] ?? null;

		if ( is_array( $customer ) && ! empty( $customer['email'] ) ) {
			return sanitize_email( $customer['email'] );
		}

		$customer_id = absint( $appointment['customer_id'] ?? 0 );

		if ( $customer_id ) {
			$user = get_userdata( $customer_id );

			if ( $user ) {
				return $user->user_email;
			}
		}

		return null;
	}

	/**
	 * Extract customer display name from appointment data
	 *
	 * @param array $appointment Normalized appointment data.
	 *
	 * @return string Customer name or empty string.
	 */
	private function get_customer_name( $appointment ) {
		$customer = $appointment['customer'] ?? null;

		if ( is_array( $customer ) ) {
			$name_parts = array_filter(
				array(
					$customer['firstName'] ?? ( $customer['name'] ?? '' ),
					$customer['lastName'] ?? '',
				)
			);

			if ( $name_parts ) {
				return implode( ' ', $name_parts );
			}
		}

		$customer_id = absint( $appointment['customer_id'] ?? 0 );

		if ( $customer_id ) {
			$user = get_userdata( $customer_id );

			if ( $user ) {
				return $user->display_name;
			}
		}

		return '';
	}
}
