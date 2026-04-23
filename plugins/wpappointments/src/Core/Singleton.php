<?php
/**
 * WPIntegrator class file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Core;

/**
 * Abstract class to keep WordPress integration methods.
 *
 * When class extends WPIntegrator, it will automatically
 * be a singleton and contain a register_hooks() method.
 *
 * Call register_hooks() will register all hooks applied
 * in given class in docblock comments.
 */
abstract class Singleton {
	/**
	 * The Singleton's instance is stored in a static field. This field is an
	 * array, because we'll allow our Singleton to have subclasses. Each item in
	 * this array will be an instance of a specific Singleton's subclass.
	 *
	 * @var array
	 */
	private static $instances = array();

	/**
	 * The Singleton's constructor should always be private to prevent direct
	 * construction calls with the `new` operator.
	 *
	 * @return void
	 */
	protected function __construct() {}

	/**
	 * Singletons should not be cloneable.
	 *
	 * @return void
	 */
	protected function __clone() {}

	/**
	 * Singletons should not be restorable from strings.
	 *
	 * @throws \Exception Throws an exception when trying to unserialize a singleton.
	 */
	public function __wakeup() {
		throw new \Exception( 'Cannot unserialize a singleton.' );
	}

	/**
	 * This is the static method that controls the access to the singleton
	 * instance. On the first run, it creates a singleton object and places it
	 * into the static field. On subsequent runs, it returns the client existing
	 * object stored in the static field.
	 *
	 * This implementation lets you subclass the Singleton class while keeping
	 * just one instance of each subclass around.
	 *
	 * @return static The Singleton instance of this class.
	 */
	public static function get_instance() {
		$class = static::class;

		if ( ! isset( self::$instances[ $class ] ) ) {
			self::$instances[ $class ] = new static();
		}

		return self::$instances[ $class ];
	}
}
