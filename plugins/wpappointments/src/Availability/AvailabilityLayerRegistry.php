<?php
/**
 * Availability layer registry class file
 *
 * Singleton registry that stores all registered availability layers.
 * Plugins use register_availability_layer() to add layers.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Availability;

use WP_Error;
use WPAppointments\Core\Singleton;

/**
 * Availability layer registry class
 */
class AvailabilityLayerRegistry extends Singleton {
	/**
	 * Registered layers
	 *
	 * @var array<string, array>
	 */
	private $layers = array();

	/**
	 * Register an availability layer
	 *
	 * @param string $slug     Unique identifier (e.g., 'system', 'location', 'entity', 'employee').
	 * @param int    $priority Evaluation order (lower = first).
	 * @param array  $config   Layer configuration: type ('base'|'narrowing'), callback (callable).
	 *
	 * @return true|WP_Error
	 */
	public function register( $slug, $priority, $config ) {
		if ( isset( $this->layers[ $slug ] ) ) {
			return new WP_Error(
				'availability_layer_exists',
				/* translators: %s: layer slug */
				sprintf( __( 'Availability layer "%s" is already registered', 'wpappointments' ), $slug )
			);
		}

		$type = $config['type'] ?? '';

		if ( ! in_array( $type, array( 'base', 'narrowing' ), true ) ) {
			return new WP_Error(
				'availability_layer_invalid_type',
				__( 'Availability layer type must be "base" or "narrowing"', 'wpappointments' )
			);
		}

		if ( ! isset( $config['callback'] ) || ! is_callable( $config['callback'] ) ) {
			return new WP_Error(
				'availability_layer_invalid_callback',
				__( 'Availability layer must have a callable callback', 'wpappointments' )
			);
		}

		$this->layers[ $slug ] = array(
			'slug'     => $slug,
			'priority' => (int) $priority,
			'type'     => $type,
			'callback' => $config['callback'],
		);

		return true;
	}

	/**
	 * Get a registered layer
	 *
	 * @param string $slug Layer slug.
	 *
	 * @return array|null
	 */
	public function get( $slug ) {
		return $this->layers[ $slug ] ?? null;
	}

	/**
	 * Get all registered layers sorted by priority
	 *
	 * @return array
	 */
	public function get_all() {
		$layers = $this->layers;

		uasort(
			$layers,
			function ( $a, $b ) {
				return $a['priority'] - $b['priority'];
			}
		);

		return apply_filters( 'wpappointments_availability_layers', $layers );
	}

	/**
	 * Check if a layer is registered
	 *
	 * @param string $slug Layer slug.
	 *
	 * @return bool
	 */
	public function has( $slug ) {
		return isset( $this->layers[ $slug ] );
	}

	/**
	 * Unregister a layer
	 *
	 * @param string $slug Layer slug.
	 *
	 * @return bool
	 */
	public function unregister( $slug ) {
		if ( ! isset( $this->layers[ $slug ] ) ) {
			return false;
		}

		unset( $this->layers[ $slug ] );

		return true;
	}

	/**
	 * Reset registry (primarily for testing)
	 *
	 * @return void
	 */
	public function reset() {
		$this->layers = array();
	}
}
