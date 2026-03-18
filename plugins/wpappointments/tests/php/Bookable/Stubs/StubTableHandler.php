<?php
/**
 * Stub table handler for tests
 *
 * @package WPAppointments
 */

namespace Tests\Bookable\Stubs;

use WPAppointments\Bookable\AbstractBookableTypeHandler;

/**
 * Stub table handler class
 */
class StubTableHandler extends AbstractBookableTypeHandler {
	/**
	 * Get the type slug
	 *
	 * @return string
	 */
	public function get_slug() {
		return 'table';
	}

	/**
	 * Get the type label
	 *
	 * @return string
	 */
	public function get_label() {
		return 'Table';
	}

	/**
	 * Get additional meta fields for this type
	 *
	 * @return array
	 */
	public function get_fields() {
		return array(
			'seats'   => array( 'default' => 4 ),
			'section' => array( 'default' => '' ),
		);
	}
}
