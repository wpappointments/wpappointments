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
	 * Generates bookable entity fixtures for use in tests.
	 *
	 * @var BookableFactory
	 */
	public $bookable;

	/**
	 * Generates bookable variant fixtures for use in tests.
	 *
	 * @var BookableVariantFactory
	 */
	public $bookable_variant;

	/**
	 * Constructor.
	 */
	public function __construct() {
		parent::__construct();

		$this->appointment      = new AppointmentFactory( $this );
		$this->service          = new ServiceFactory( $this );
		$this->bookable         = new BookableFactory( $this );
		$this->bookable_variant = new BookableVariantFactory( $this );
	}
}
