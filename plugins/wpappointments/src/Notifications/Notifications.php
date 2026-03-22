<?php
/**
 * Notifications class file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Notifications;

use WPAppointments\Core\PluginInfo;
use WPAppointments\Core\Singleton;
use WPAppointments\Data\Model\Settings;

/**
 * Handles email notifications for appointment lifecycle events
 */
class Notifications extends Singleton {
	/**
	 * Cached event definitions (built lazily via get_events()).
	 *
	 * @var array|null
	 */
	private static $events = null;

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
	 * Get event definitions with localized strings
	 *
	 * Built lazily so __() runs after load_textdomain().
	 *
	 * @return array
	 */
	public static function get_events() {
		if ( null === self::$events ) {
			self::$events = array(
				'created'   => array(
					'title'            => __( 'Appointment Created', 'wpappointments' ),
					'description'      => __( 'Sent when a new appointment is booked.', 'wpappointments' ),
					'adminSubject'     => __( 'New appointment booked', 'wpappointments' ),
					'customerSubject'  => __( 'Your appointment has been booked', 'wpappointments' ),
					'adminTemplate'    => 'appointment-created-admin',
					'customerTemplate' => 'appointment-created-customer',
				),
				'updated'   => array(
					'title'            => __( 'Appointment Updated', 'wpappointments' ),
					'description'      => __( 'Sent when an existing appointment is modified.', 'wpappointments' ),
					'adminSubject'     => __( 'Appointment updated', 'wpappointments' ),
					'customerSubject'  => __( 'Your appointment has been updated', 'wpappointments' ),
					'adminTemplate'    => 'appointment-updated-admin',
					'customerTemplate' => 'appointment-updated-customer',
				),
				'confirmed' => array(
					'title'            => __( 'Appointment Confirmed', 'wpappointments' ),
					'description'      => __( 'Sent when an appointment is confirmed.', 'wpappointments' ),
					'adminSubject'     => __( 'Appointment confirmed', 'wpappointments' ),
					'customerSubject'  => __( 'Your appointment is confirmed', 'wpappointments' ),
					'adminTemplate'    => 'appointment-confirmed-admin',
					'customerTemplate' => 'appointment-confirmed-customer',
				),
				'cancelled' => array(
					'title'            => __( 'Appointment Cancelled', 'wpappointments' ),
					'description'      => __( 'Sent when an appointment is cancelled.', 'wpappointments' ),
					'adminSubject'     => __( 'Appointment cancelled', 'wpappointments' ),
					'customerSubject'  => __( 'Your appointment has been cancelled', 'wpappointments' ),
					'adminTemplate'    => 'appointment-cancelled-admin',
					'customerTemplate' => 'appointment-cancelled-customer',
				),
			);
		}

		return self::$events;
	}

	/**
	 * Get event definitions for the frontend (title, description, defaults)
	 *
	 * @return array
	 */
	public static function get_event_definitions() {
		return self::get_events();
	}

	/**
	 * Send notification when appointment is created
	 *
	 * @param array $appointment Normalized appointment data.
	 *
	 * @return void
	 */
	public function on_created( $appointment ) {
		$this->dispatch( 'created', $appointment );
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
		$this->dispatch( 'updated', $appointment, $old_appointment );
	}

	/**
	 * Send notification when appointment is confirmed
	 *
	 * @param array      $appointment     Confirmed appointment data.
	 * @param array|null $old_appointment Previous appointment data.
	 *
	 * @return void
	 */
	public function on_confirmed( $appointment, $old_appointment = null ) {
		$this->dispatch( 'confirmed', $appointment, $old_appointment );
	}

	/**
	 * Send notification when appointment is cancelled
	 *
	 * @param array $appointment Cancelled appointment data.
	 *
	 * @return void
	 */
	public function on_cancelled( $appointment ) {
		$this->dispatch( 'cancelled', $appointment );
	}

	/**
	 * Dispatch notifications for a given event, respecting user settings
	 *
	 * @param string     $event            Event key (created|updated|confirmed|cancelled).
	 * @param array      $appointment      Normalized appointment data.
	 * @param array|null $old_appointment  Previous appointment data (for updated events).
	 *
	 * @return void
	 */
	private function dispatch( $event, $appointment, $old_appointment = null ) {
		$config     = $this->get_event_config( $event );
		$event_def  = self::get_events()[ $event ];
		$recipients = array();

		if ( ! $config['enabled'] ) {
			return;
		}

		/**
		 * Fires before a notification is dispatched.
		 *
		 * Allows third-party plugins (e.g. BracketSpace Notification) to hook
		 * into the notification lifecycle.
		 *
		 * @param string     $event           Event key (created|updated|confirmed|cancelled).
		 * @param array      $appointment     Normalized appointment data.
		 * @param array      $config          Notification config for this event.
		 * @param array|null $old_appointment Previous appointment data.
		 */
		do_action( 'wpappointments_before_notification', $event, $appointment, $config, $old_appointment );

		if ( $config['sendToAdmin'] ) {
			$subject = $config['adminSubject'] ? $config['adminSubject'] : $event_def['adminSubject'];
			$subject = $this->resolve_subject( $subject, $appointment, $old_appointment );
			$body    = $this->resolve_body( $config['adminBody'], $event_def['adminTemplate'], $appointment, $old_appointment );
			if ( $this->send_to_admin( $subject, $body ) ) {
				$recipients[] = 'admin';
			}
		}

		if ( $config['sendToCustomer'] ) {
			$subject = $config['customerSubject'] ? $config['customerSubject'] : $event_def['customerSubject'];
			$subject = $this->resolve_subject( $subject, $appointment, $old_appointment );
			$body    = $this->resolve_body( $config['customerBody'], $event_def['customerTemplate'], $appointment, $old_appointment );

			if ( $this->send_to_customer( $appointment, $subject, $body ) ) {
				$recipients[] = 'customer';
			}
		}

		$custom_recipients = array_filter( array_map( 'trim', explode( ',', $config['customRecipients'] ) ) );

		foreach ( $custom_recipients as $recipient ) {
			if ( is_email( $recipient ) ) {
				$subject = $config['adminSubject'] ? $config['adminSubject'] : $event_def['adminSubject'];
				$subject = $this->resolve_subject( $subject, $appointment, $old_appointment );
				$body    = $this->resolve_body( $config['adminBody'], $event_def['adminTemplate'], $appointment, $old_appointment );

				if ( $this->send( $recipient, $subject, $body ) ) {
					$recipients[] = $recipient;
				}
			}
		}

		/**
		 * Fires after a notification has been dispatched.
		 *
		 * Allows third-party plugins to react after emails are sent, e.g.
		 * for logging, webhooks, or integration with external notification
		 * services like BracketSpace Notification.
		 *
		 * @param string     $event           Event key.
		 * @param array      $appointment     Normalized appointment data.
		 * @param array      $recipients      List of recipients that were notified.
		 * @param array      $config          Notification config for this event.
		 * @param array|null $old_appointment Previous appointment data.
		 */
		do_action( 'wpappointments_after_notification', $event, $appointment, $recipients, $config, $old_appointment );
	}

	/**
	 * Interpolate merge tags in a subject line and sanitize for plain text
	 *
	 * @param string     $subject          Subject string with optional {variable} placeholders.
	 * @param array      $appointment      Normalized appointment data.
	 * @param array|null $old_appointment  Previous appointment data.
	 *
	 * @return string Plain-text subject.
	 */
	private function resolve_subject( $subject, $appointment, $old_appointment = null ) {
		$resolved = $this->interpolate( $subject, $appointment, $old_appointment );

		return wp_specialchars_decode( wp_strip_all_tags( $resolved ), ENT_QUOTES );
	}

	/**
	 * Resolve the email body — use custom body if set, otherwise load HTML template
	 *
	 * @param string     $custom_body      Custom body from settings (may be empty).
	 * @param string     $template_name    Default HTML template file name.
	 * @param array      $appointment      Normalized appointment data.
	 * @param array|null $old_appointment  Previous appointment data.
	 *
	 * @return string Interpolated email body.
	 */
	private function resolve_body( $custom_body, $template_name, $appointment, $old_appointment = null ) {
		if ( ! empty( $custom_body ) ) {
			$interpolated = $this->interpolate( $custom_body, $appointment, $old_appointment );

			return $this->wrap_html( $interpolated );
		}

		$template_path = PluginInfo::get_plugin_dir_path() . 'includes/notifications/emails/html/' . $template_name . '.html';

		if ( file_exists( $template_path ) ) {
			ob_start();
			require $template_path;
			$template = ob_get_clean();

			$interpolated = $this->interpolate( $template, $appointment, $old_appointment );

			return $this->wrap_html( $interpolated );
		}

		return $this->build_fallback_message( $appointment );
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
			'adminSubject'     => '',
			'customerSubject'  => '',
			'adminBody'        => '',
			'customerBody'     => '',
		);

		if ( ! is_array( $stored ) ) {
			return $defaults;
		}

		return array_merge( $defaults, $stored );
	}

	/**
	 * Replace template variables in a string with appointment data
	 *
	 * Supported variables:
	 * {id}, {service}, {status}, {date}, {time}, {duration}, {customer_name},
	 * {previous_date}, {previous_time}, {previous_status},
	 * {admin_first_name}, {admin_last_name}, {admin_email}, {admin_phone}
	 *
	 * @param string     $template         Template string with {variable} placeholders.
	 * @param array      $appointment      Normalized appointment data.
	 * @param array|null $old_appointment  Previous appointment data.
	 *
	 * @return string Interpolated string.
	 */
	private function interpolate( $template, $appointment, $old_appointment = null ) {
		$formats = $this->get_formats();

		$timestamp     = absint( $appointment['timestamp'] ?? 0 );
		$old_timestamp = $old_appointment ? absint( $old_appointment['timestamp'] ?? 0 ) : 0;

		$settings = new Settings();

		$admin_first = $settings->get_setting( 'general', 'firstName' );
		$admin_last  = $settings->get_setting( 'general', 'lastName' );
		$admin_email = $settings->get_setting( 'general', 'email' );
		$admin_phone = $settings->get_setting( 'general', 'phoneNumber' );

		$replacements = array(
			'{id}'               => absint( $appointment['id'] ?? 0 ),
			'{service}'          => esc_html( $appointment['service'] ?? '' ),
			'{status}'           => esc_html( ucfirst( $appointment['status'] ?? '' ) ),
			'{date}'             => $timestamp ? esc_html( wp_date( $formats['date'], $timestamp ) ) : '—',
			'{time}'             => $timestamp ? esc_html( wp_date( $formats['time'], $timestamp ) ) : '—',
			'{duration}'         => absint( $appointment['duration'] ?? 0 ),
			'{customer_name}'    => esc_html( $this->get_customer_name( $appointment ) ),
			'{previous_date}'    => $old_timestamp ? esc_html( wp_date( $formats['date'], $old_timestamp ) ) : '',
			'{previous_time}'    => $old_timestamp ? esc_html( wp_date( $formats['time'], $old_timestamp ) ) : '',
			'{previous_status}'  => $old_appointment ? esc_html( ucfirst( $old_appointment['status'] ?? '' ) ) : '',
			'{admin_first_name}' => esc_html( $admin_first ? $admin_first : '' ),
			'{admin_last_name}'  => esc_html( $admin_last ? $admin_last : '' ),
			'{admin_email}'      => esc_html( $admin_email ? $admin_email : get_option( 'admin_email' ) ),
			'{admin_phone}'      => esc_html( $admin_phone ? $admin_phone : '' ),
		);

		return str_replace( array_keys( $replacements ), array_values( $replacements ), $template );
	}

	/**
	 * Get date and time format strings from plugin settings
	 *
	 * @return array{date: string, time: string}
	 */
	private function get_formats() {
		$settings = new Settings();

		$date = $settings->get_setting( 'general', 'dateFormat' );
		$time = $settings->get_setting( 'general', 'timeFormat' );

		$wp_date = get_option( 'date_format' );
		$wp_time = get_option( 'time_format' );

		return array(
			'date' => $date ? $date : ( $wp_date ? $wp_date : 'd/m/Y' ),
			'time' => $time ? $time : ( $wp_time ? $wp_time : 'H:i' ),
		);
	}

	/**
	 * Wrap plain text content in a simple HTML email layout
	 *
	 * @param string $content Email content (may contain newlines).
	 *
	 * @return string HTML email body.
	 */
	private function wrap_html( $content ) {
		$site_name = esc_html( get_bloginfo( 'name' ) );
		$content   = nl2br( $content );

		return '<html><body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;">'
		. '<h2 style="color:#174aff;">' . $site_name . '</h2>'
		. '<div style="line-height:1.6;">' . $content . '</div>'
		. '</body></html>';
	}

	/**
	 * Build a fallback plain HTML email body when no template is available
	 *
	 * @param array $appointment Normalized appointment data.
	 *
	 * @return string HTML email body.
	 */
	private function build_fallback_message( $appointment ) {
		$service        = esc_html( $appointment['service'] ?? '' );
		$status         = esc_html( ucfirst( $appointment['status'] ?? '' ) );
		$appointment_id = absint( $appointment['id'] ?? 0 );
		$customer_name  = esc_html( $this->get_customer_name( $appointment ) );
		$formats        = $this->get_formats();

		$timestamp = absint( $appointment['timestamp'] ?? 0 );
		$date_time = $timestamp ? wp_date( $formats['date'] . ' ' . $formats['time'], $timestamp ) : '—';

		$duration  = absint( $appointment['duration'] ?? 0 );
		$site_name = esc_html( get_bloginfo( 'name' ) );

		$message  = '<html><body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;">';
		$message .= '<h2 style="color:#174aff;">' . $site_name . '</h2>';
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
		 */
		return apply_filters( 'wpappointments_notification_message', $message, $appointment );
	}

	/**
	 * Build a single table row for the fallback email template
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
	 * Send email to admin
	 *
	 * @param string $subject Email subject.
	 * @param string $message Email message (HTML).
	 *
	 * @return bool Whether the email was sent successfully.
	 */
	private function send_to_admin( $subject, $message ) {
		$plugin_email = get_option( 'wpappointments_general_email' );
		$admin_email  = $plugin_email ? $plugin_email : get_option( 'admin_email' );

		if ( ! $admin_email ) {
			return false;
		}

		return $this->send( $admin_email, $subject, $message );
	}

	/**
	 * Send email to customer
	 *
	 * @param array  $appointment Appointment data.
	 * @param string $subject     Email subject.
	 * @param string $message     Email message (HTML).
	 *
	 * @return bool Whether the email was sent successfully.
	 */
	private function send_to_customer( $appointment, $subject, $message ) {
		$customer_email = $this->get_customer_email( $appointment );

		if ( ! $customer_email ) {
			return false;
		}

		return $this->send( $customer_email, $subject, $message );
	}

	/**
	 * Send email using wp_mail
	 *
	 * @param string $to      Recipient email.
	 * @param string $subject Email subject.
	 * @param string $message Email message (HTML).
	 *
	 * @return bool Whether the email was sent successfully.
	 */
	private function send( $to, $subject, $message ) {
		$site_name = get_bloginfo( 'name' );
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

		return wp_mail( $to, $full_subject, $message, $headers );
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
