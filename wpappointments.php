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
define( 'WPAPPOINTMENTS_API_NAMESPACE', 'wpappointments/v1' );

define( 'WPAPPOINTMENTS_REQUIRED_PHP', '7.4' );

if ( version_compare( phpversion(), WPAPPOINTMENTS_REQUIRED_PHP, '<' ) ) {
	return false;
}

global $wpappointments;

/**
 * Autoload classes
 */
require_once __DIR__ . '/vendor/autoload.php';

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

add_action(
	'init',
	function () {
		register_post_type(
			'appointment',
			array(
				'public'   => true,
				'supports' => array( 'custom-fields' ),
			)
		);
	}
);

/**
 * Include admin files
 */
require_once __DIR__ . '/includes/admin.php';
require_once __DIR__ . '/includes/client.php';
require_once __DIR__ . '/includes/gutenberg.php';
