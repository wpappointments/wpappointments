<?php
/**
 * Invalid handler stub for tests
 *
 * @package WPAppointments
 */

namespace Tests\Bookable\Stubs;

/**
 * Invalid handler that does not extend AbstractBookableTypeHandler
 */
class InvalidHandler {
	/**
	 * Get the type slug
	 *
	 * @return string
	 */
	public function get_slug() {
		return 'invalid';
	}
}
