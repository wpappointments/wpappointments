<?php
/**
 * Bookable type registry class file
 *
 * Singleton registry that stores all registered bookable types and their
 * handlers. Plugins use register_bookable_type() to add types.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Bookable;

use WP_Error;
use WPAppointments\Core\Singleton;

/**
 * Bookable type registry class
 */
class BookableTypeRegistry extends Singleton {
	/**
	 * Registered bookable types
	 *
	 * @var array<string, AbstractBookableTypeHandler>
	 */
	private $types = array();

	/**
	 * Register a bookable type
	 *
	 * @param string $slug          Type slug (e.g., 'service', 'table', 'room').
	 * @param string $handler_class Fully-qualified handler class name.
	 *
	 * @return AbstractBookableTypeHandler|WP_Error
	 */
	public function register( $slug, $handler_class ) {
		if ( isset( $this->types[ $slug ] ) ) {
			return new WP_Error(
				'bookable_type_exists',
				/* translators: %s: bookable type slug */
				sprintf( __( 'Bookable type "%s" is already registered', 'wpappointments' ), $slug )
			);
		}

		if ( ! class_exists( $handler_class ) ) {
			return new WP_Error(
				'bookable_type_handler_not_found',
				/* translators: %s: handler class name */
				sprintf( __( 'Bookable type handler class "%s" not found', 'wpappointments' ), $handler_class )
			);
		}

		if ( ! is_subclass_of( $handler_class, AbstractBookableTypeHandler::class ) ) {
			return new WP_Error(
				'bookable_type_handler_invalid',
				/* translators: %s: handler class name */
				sprintf( __( 'Bookable type handler "%s" must extend AbstractBookableTypeHandler', 'wpappointments' ), $handler_class )
			);
		}

		$handler = new $handler_class();

		$this->types[ $slug ] = $handler;

		do_action( 'wpappointments_bookable_type_registered', $slug, $handler );

		return $handler;
	}

	/**
	 * Get a registered bookable type handler
	 *
	 * @param string $slug Type slug.
	 *
	 * @return AbstractBookableTypeHandler|null
	 */
	public function get( $slug ) {
		return $this->types[ $slug ] ?? null;
	}

	/**
	 * Get all registered bookable types
	 *
	 * @return array<string, AbstractBookableTypeHandler>
	 */
	public function get_all() {
		return $this->types;
	}

	/**
	 * Check if a bookable type is registered
	 *
	 * @param string $slug Type slug.
	 *
	 * @return bool
	 */
	public function has( $slug ) {
		return isset( $this->types[ $slug ] );
	}

	/**
	 * Unregister a bookable type
	 *
	 * @param string $slug Type slug.
	 *
	 * @return bool True if removed, false if not found.
	 */
	public function unregister( $slug ) {
		if ( ! isset( $this->types[ $slug ] ) ) {
			return false;
		}

		unset( $this->types[ $slug ] );

		return true;
	}

	/**
	 * Reset registry (primarily for testing)
	 *
	 * @return void
	 */
	public function reset() {
		$this->types = array();
	}
}
