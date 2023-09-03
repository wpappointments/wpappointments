<?php
/**
 * Plugin Name: WP Appointments
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments;

defined( 'ABSPATH' ) || exit;

/**
 * Plugin directories constants
 */
define( 'WPAPPOINTMENTS_PLUGIN_FILE', __FILE__ );
define( 'WPAPPOINTMENTS_PLUGIN_DIR_PATH', plugin_dir_path( __FILE__ ) );
define( 'WPAPPOINTMENTS_PLUGIN_DIR_URL', plugin_dir_url( __FILE__ ) );

define( 'WPAPPOINTMENTS_VERSION', '0.0.1' );

/**
 * Autoload classes
 */
require_once 'vendor/autoload.php';

/**
 * Initialize plugin
 */
$wpappointments = Plugin::get_instance();

register_activation_hook(
	WPAPPOINTMENTS_PLUGIN_FILE,
	array(
		$wpappointments,
		'on_plugin_activation',
	)
);

register_deactivation_hook(
	WPAPPOINTMENTS_PLUGIN_FILE,
	array(
		$wpappointments,
		'on_plugin_deactivation',
	)
);

$wpappointments->register_hooks();
