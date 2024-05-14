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
	 * Create many new appointments
	 *
	 * @param int   $count Number of appointments to create.
	 * @param array $args Appointment data.
	 *
	 * @return int[]
	 */
	protected function create_appointments( $count = 10, $args = array() ) {
		return $this->factory()->appointment->create_many( $count, $args );
	}

	/**
	 * Create new service
	 *
	 * @param array $args Service data.
	 *
	 * @return int
	 */
	protected function create_service( $args = array() ) {
		return $this->factory()->service->create( $args );
	}

	/**
	 * Create many new services
	 *
	 * @param int   $count Number of services to create.
	 * @param array $args Service data.
	 *
	 * @return int[]
	 */
	protected function create_services( $count = 10, $args = array() ) {
		return $this->factory()->service->create_many( $count, $args );
	}

	/**
	 * Spy on a hook by counting its executions
	 *
	 * @param string $hook_name Hook name.
	 *
	 * @return void
	 */
	protected function spy_hook( $hook_name ) {
		add_action(
			$hook_name,
			function () {
				$executions_count_name = current_filter() . '_executions_count';
				$executions_count      = get_transient( $executions_count_name );
				set_transient( $executions_count_name, $executions_count + 1 );
			}
		);
	}

	/**
	 * Get the number of times a hook has been executed
	 *
	 * @param string $hook_name Hook name.
	 *
	 * @return int
	 */
	protected function get_hook_executions_count( $hook_name ) {
		return get_transient( $hook_name . '_executions_count' ) || 0;
	}
}
