<?php
/**
 * Bootstrap the plugin unit testing environment.
 *
 * @package WPAppointments
 */

$wp_tests_dir = getenv( 'WP_TESTS_DIR' ) ? getenv( 'WP_TESTS_DIR' ) : sys_get_temp_dir();

require_once $wp_tests_dir . '/includes/functions.php';

/**
 * Manually load the plugin being tested.
 *
 * @since 0.0.1
 */
function _manually_load_plugin() {
	$tests_dir  = __DIR__;
	$plugin_dir = dirname( dirname( dirname( $tests_dir ) ) );
	require $plugin_dir . '/plugins/wpappointments/wpappointments.php';
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

require_once $wp_tests_dir . '/includes/bootstrap.php';
