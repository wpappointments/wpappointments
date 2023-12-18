<?php
/**
 * API class file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Api;

use WPAppointments\Core;

/**
 * REST Api class
 */
class Api extends Core\Singleton {
	/**
	 * Initialise plugin REST API endpoints
	 *
	 * @return void
	 */
	public function init() {
		Endpoints\Ping::init();
		Endpoints\Appointment::init();
		Endpoints\Settings::init();
	}
}
