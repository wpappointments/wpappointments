<?php
/**
 * Plugin Name: Appointments Booking
 * Version:     0.2.0
 * Description: Next-gen appointment scheduling for WordPress. Extensible, developer-friendly booking system with variant support.
 * Author:      Appsy
 * License:     GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: appointments-booking
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

// Stop loading the plugin if the PHP version is not met.
if ( ! PluginInfo::get_instance()->is_php_version_met() ) {
	return false;
}

// Load the plugin and store in a global variable.
$wpappointments = Plugin::get_instance();

// Register activation and deactivation hooks.
Core\Activation::register_hooks( PluginInfo::get_instance(), $wpappointments );

// Load plugin functions.
require_once __DIR__ . '/includes/functions.php';
