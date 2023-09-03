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
class Api extends Core\WPIntegrator implements Core\Hookable {
	/**
	 * Initialise plugin REST API endpoints
	 *
	 * @action rest_api_init
	 *
	 * @return void
	 */
	public function init() {
		Endpoints\Ping::init();
		Endpoints\Appointment::init();
	}
}
