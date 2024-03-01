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

	return array(
		'timezones'    => timezone_identifiers_list(),
		'siteTimezone' => wp_timezone_string(),
		'startOfWeek'  => (int) $settings->get_setting( 'general', 'startOfWeek' ),
		'formatMaps'   => array(
			'date' => $php_to_js_date_format_map,
			'time' => $php_to_js_time_format_map,
		),
		'formats'      => array(
			'date' => $settings->get_setting( 'general', 'dateFormat' ),
			'time' => $settings->get_setting( 'general', 'timeFormat' ),
		),
		'formatsJs'    => array(
			'date' => $php_to_js_date_format_map[ $settings->get_setting( 'general', 'dateFormat' ) ],
			'time' => $php_to_js_time_format_map[ $settings->get_setting( 'general', 'timeFormat' ) ],
		),
	);
}
