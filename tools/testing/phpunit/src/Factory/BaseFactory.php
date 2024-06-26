<?php
/**
 * Base factory class.
 *
 * @package WPAppointments
 * @since 0.1.2
 */

namespace TestTools\Factory;

use WP_UnitTest_Factory;

/**
 * Base factory class.
 */
class BaseFactory extends WP_UnitTest_Factory {
	/**
	 * Generates appointment fixtures for use in tests.
	 *
	 * @var AppointmentFactory
	 */
	public $appointment;

	/**
	 * Generates service fixtures for use in tests.
	 *
	 * @var ServiceFactory
	 */
	public $service;

	/**
	 * Constructor.
	 */
	public function __construct() {
		parent::__construct();

		$this->appointment = new AppointmentFactory( $this );
		$this->service     = new ServiceFactory( $this );
	}
}
