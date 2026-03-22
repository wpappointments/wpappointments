<?php
/**
 * Legacy email template utilities
 *
 * Hook-based email dispatching has been consolidated into
 * \WPAppointments\Notifications\Notifications. This file retains
 * only the shared helpers that the Notifications class relies on
 * (template loading, merge-tag evaluation, date formats).
 *
 * @package WPAppointments
 * @since 0.0.1
 */

use WPAppointments\Core\PluginInfo;
use WPAppointments\Data\Model\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Evaluate merge tags in an email template string
 *
 * @param string                           $content              Email content.
 * @param \WPAppointments\Appointment      $new_appointment      Appointment object.
 * @param \WPAppointments\Appointment|null $previous_appointment Previous appointment object.
 *
 * @return string
 */
function evaluate_merge_tag( $content, $new_appointment, $previous_appointment = null ) {
	$formats  = get_date_formats();
	$settings = new Settings();
	$customer = maybe_unserialize( $new_appointment['customer'] );

	$tags = array(
		'{customer_name}'    => $customer['name'] ?? '',
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
