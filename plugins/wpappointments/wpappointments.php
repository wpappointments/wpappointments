<?php
/**
 * Plugin Name: WP Appointments
 * Plugin URI:  https://wpappointments.com
 * Version:     0.2.0
 * Description: Next-gen appointment scheduling for WordPress. Extensible, developer-friendly booking system with variant support.
 * Author:      WP Appointments
 * Author URI:  https://wpappointments.com
 * License:     GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: wpappointments
 * Domain Path: /languages
 * Requires at least: 6.4
 * Requires PHP: 8.2
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments;

use WPAppointments\Core\PluginInfo;

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

// Load Composer autoloader.
require_once __DIR__ . '/vendor/autoload.php';

// Define plugin constants.
define( 'WPAPPOINTMENTS_FILE', __FILE__ );
define( 'WPAPPOINTMENTS_DIR_PATH', plugin_dir_path( __FILE__ ) );
define( 'WPAPPOINTMENTS_DIR_URL', plugin_dir_url( __FILE__ ) );

// Global variable for storing plugin instance singleton.
global $wpappointments;

// Get plugin information.
$plugin_info = PluginInfo::get_instance();

// Stop loading the plugin if the PHP version is not met.
if ( ! $plugin_info->is_php_version_met() ) {
	return false;
}

// Load the plugin and store in a global variable.
$wpappointments = Plugin::get_instance();

// Register activation and deactivation hooks.
$activation = new Core\Activation( $plugin_info, $wpappointments );
$activation->register_hooks();

// Load plugin functions.
require_once __DIR__ . '/includes/functions.php';
