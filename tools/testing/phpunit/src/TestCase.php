<?php
/**
 * WordPress PHPUnit test case class
 *
 * @package WPAppointments
 */

namespace TestTools;

/**
 * Abstract WordPress PHPUnit test case class
 */
abstract class TestCase extends \WP_UnitTestCase {
	/**
	 * Create new default customer
	 */
	protected function create_default_customer() {
		return $this->factory()->user->create(
			array(
				'role'         => 'wpa-customer',
				'display_name' => 'John Doe',
				'user_email'   => 'john@example.com',
				'meta_input'   => array(
					'phone' => '12345',
				),
			)
		);
	}

	/**
	 * Create new default customer
	 */
	protected function create_empty_customer() {
		return $this->factory()->user->create(
			array(
				'role' => 'wpa-customer',
			)
		);
	}

	/**
	 * Create many new default customers
	 */
	protected function create_empty_customers( $count = 10 ) {
		return $this->factory()->user->create_many(
			$count,
			array(
				'role' => 'wpa-customer',
			)
		);
	}
}
