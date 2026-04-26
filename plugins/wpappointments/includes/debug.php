<?php
/**
 * Debug utility functions
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WPAppointments\Core\PluginInfo;


add_action(
	'init',
	function () {
		// Existing debug init logic if any (none currently besides post types).
	}
);
