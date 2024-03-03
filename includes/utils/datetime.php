<?php
/**
 * Date and time utility functions
 *
 * @package WPAppointments
 * @since 0.0.1
 */

use WPAppointments\Model\Settings;

/**
 * Create date settings array
 */
function create_date_settings_array() {
	$php_to_js_date_format_map = array(
		'F j, Y' => 'MMMM d, yyyy',
		'Y-m-d'  => 'yyyy-MM-dd',
		'm/d/Y'  => 'MM/dd/yyyy',
		'd/m/Y'  => 'dd/MM/yyyy',
	);

	$php_to_js_time_format_map = array(
		'g:i a' => 'h:mm aaa',
		'g:i A' => 'h:mm aa',
		'H:i'   => 'HH:mm',
	);

	$settings = new Settings();
	$formats  = get_date_formats();

	return array(
		'timezones'    => timezone_identifiers_list(),
		'siteTimezone' => wp_timezone_string(),
		'startOfWeek'  => (int) $settings->get_setting( 'general', 'startOfWeek' ),
		'formatMaps'   => array(
			'date' => $php_to_js_date_format_map,
			'time' => $php_to_js_time_format_map,
		),
		'formats'      => array(
			'date' => $formats['date'],
			'time' => $formats['time'],
		),
		'formatsJs'    => array(
			'date' => $formats['date'] ? $php_to_js_date_format_map[ $formats['date'] ] : 'MMMM d, yyyy',
			'time' => $formats['time'] ? $php_to_js_time_format_map[ $formats['time'] ] : 'h:mm aa',
		),
	);
}

/**
 * Get date format and time formats
 *
 * @return array
 */
function get_date_formats() {
	$settings = new Settings();

	$date = $settings->get_setting( 'general', 'dateFormat' );
	$time = $settings->get_setting( 'general', 'timeFormat' );

	if ( ! $date ) {
		$date = get_option( 'date_format' );
	}

	if ( ! $time ) {
		$time = get_option( 'time_format' );
	}

	return array(
		'date' => $date,
		'time' => $time,
	);
}
