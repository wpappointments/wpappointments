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
	 * Register notification hooks
	 */
	public function __construct() {
		add_action( 'wpappointments_appointment_created', array( $this, 'on_created' ) );
		add_action( 'wpappointments_appointment_updated', array( $this, 'on_updated' ), 10, 2 );
		add_action( 'wpappointments_appointment_confirmed', array( $this, 'on_confirmed' ), 10, 2 );
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
		$this->send_to_admin(
			__( 'New appointment booked', 'wpappointments' ),
			$this->build_message( $appointment, __( 'A new appointment has been booked.', 'wpappointments' ) )
		);

		$this->send_to_customer(
			$appointment,
			__( 'Your appointment has been booked', 'wpappointments' ),
			$this->build_message( $appointment, __( 'Your appointment has been successfully booked.', 'wpappointments' ) )
		);
	}

	/**
	 * Send notification when appointment is updated
	 *
	 * @param array $appointment     Updated appointment data.
	 * @param array $old_appointment Previous appointment data.
	 *
	 * @return void
	 */
	public function on_updated( $appointment, $old_appointment ) {
		$this->send_to_admin(
			__( 'Appointment updated', 'wpappointments' ),
			$this->build_message( $appointment, __( 'An appointment has been updated.', 'wpappointments' ) )
		);

		$this->send_to_customer(
			$appointment,
			__( 'Your appointment has been updated', 'wpappointments' ),
			$this->build_message( $appointment, __( 'Your appointment has been updated.', 'wpappointments' ) )
		);
	}

	/**
	 * Send notification when appointment is confirmed
	 *
	 * @param array $appointment     Confirmed appointment data.
	 * @param array $old_appointment Previous appointment data (may be null for direct confirms).
	 *
	 * @return void
	 */
	public function on_confirmed( $appointment, $old_appointment = null ) {
		$this->send_to_admin(
			__( 'Appointment confirmed', 'wpappointments' ),
			$this->build_message( $appointment, __( 'An appointment has been confirmed.', 'wpappointments' ) )
		);

		$this->send_to_customer(
			$appointment,
			__( 'Your appointment is confirmed', 'wpappointments' ),
			$this->build_message( $appointment, __( 'Your appointment has been confirmed.', 'wpappointments' ) )
		);
	}

	/**
	 * Send notification when appointment is cancelled
	 *
	 * @param array $appointment Cancelled appointment data.
	 *
	 * @return void
	 */
	public function on_cancelled( $appointment ) {
		$this->send_to_admin(
			__( 'Appointment cancelled', 'wpappointments' ),
			$this->build_message( $appointment, __( 'An appointment has been cancelled.', 'wpappointments' ) )
		);

		$this->send_to_customer(
			$appointment,
			__( 'Your appointment has been cancelled', 'wpappointments' ),
			$this->build_message( $appointment, __( 'Your appointment has been cancelled.', 'wpappointments' ) )
		);
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
		$site_name = get_bloginfo( 'name' );
		$headers   = array( 'Content-Type: text/html; charset=UTF-8' );

		/**
		 * Filters the email headers for WP Appointments notifications.
		 *
		 * @param array  $headers     Email headers.
		 * @param string $to          Recipient email.
		 * @param string $subject     Email subject.
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

		$raw_date_format = get_option( 'wpappointments_general_dateFormat' );
		$raw_time_format = get_option( 'wpappointments_general_timeFormat' );
		$date_format     = $raw_date_format ? $raw_date_format : 'd/m/Y';
		$time_format     = $raw_time_format ? $raw_time_format : 'H:i';

		$timestamp = absint( $appointment['timestamp'] ?? 0 );
		$date_time = $timestamp ? wp_date( $date_format . ' ' . $time_format, $timestamp ) : '—';

		$duration = absint( $appointment['duration'] ?? 0 );

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
