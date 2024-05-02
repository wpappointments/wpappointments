<?php
/**
 * WordPress PHPUnit test case class
 *
 * @package WPAppointments
 */

namespace TestTools;

use TestTools\Factory\BaseFactory;

/**
 * Abstract WordPress PHPUnit test case class
 */
abstract class TestCase extends \WP_UnitTestCase {
	/**
	 * Override the default factory to use our own.
	 *
	 * @return Factory|null Factory instance.
	 */
	protected static function factory() {
		static $factory = null;

		if ( ! $factory ) {
			$factory = new BaseFactory();
		}

		return $factory;
	}

	/**
	 * Create new default customer
	 *
	 * @return int
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
	 *
	 * @return int
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
	 *
	 * @param int $count Number of customers to create.
	 */
	protected function create_empty_customers( $count = 10 ) {
		return $this->factory()->user->create_many(
			$count,
			array(
				'role' => 'wpa-customer',
			)
		);
	}

	/**
	 * Create new appointment
	 *
	 * @param array $args Appointment data.
	 *
	 * @return int
	 */
	protected function create_appointment( $args = array() ) {
		return $this->factory()->appointment->create( $args );
	}

	/**
	 * Create new appointment
	 *
	 * @param int   $count Number of appointments to create.
	 * @param array $args Appointment data.
	 *
	 * @return int[]
	 */
	protected function create_appointments( $count = 10, $args = array() ) {
		return $this->factory()->appointment->create_many( $count, $args );
	}
}
