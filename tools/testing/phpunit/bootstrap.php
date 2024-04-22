<?php
/**
 * Bootstrap the plugin unit testing environment.
 *
 * @package WPAppointments
 */

namespace TestTools;

$wp_tests_dir = getenv( 'WP_TESTS_DIR' ) ? getenv( 'WP_TESTS_DIR' ) : sys_get_temp_dir();

require_once $wp_tests_dir . '/includes/functions.php';
require_once $wp_tests_dir . '/includes/bootstrap.php';
