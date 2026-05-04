<?php
/**
 * Plugin Name:       Appstip Booking
 * Plugin URI:        https://appstip.com/booking
 * Description:       A focused foundation for appointment management in WordPress.
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      8.1
 * Author:            Appstip
 * Author URI:        https://appstip.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       appstip-booking
 * Domain Path:       /languages
 *
 * @package Appstip\Booking
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'APPSTIP_BOOKING_VERSION', '0.1.0' );
define( 'APPSTIP_BOOKING_FILE', __FILE__ );
define( 'APPSTIP_BOOKING_DIR', plugin_dir_path( __FILE__ ) );

require_once APPSTIP_BOOKING_DIR . 'src/Plugin.php';
require_once APPSTIP_BOOKING_DIR . 'src/PostType.php';
require_once APPSTIP_BOOKING_DIR . 'src/Admin/SettingsPage.php';

\Appstip\Booking\Plugin::instance()->boot();
