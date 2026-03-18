<?php
/**
 * Availability helper functions
 *
 * Global convenience functions for registering availability layers
 * and querying effective availability.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Availability;

/**
 * Register an availability layer
 *
 * @param string $slug     Unique identifier (e.g., 'location', 'employee').
 * @param int    $priority Evaluation order (lower = first).
 * @param array  $config   Array with 'type' ('base'|'narrowing') and 'callback' (callable).
 *
 * @return true|\WP_Error
 */
function register_availability_layer( $slug, $priority, $config ) {
	return AvailabilityLayerRegistry::get_instance()->register( $slug, $priority, $config );
}

/**
 * Get effective availability for a bookable variant
 *
 * Walks through all registered layers to compute final availability.
 *
 * @param int   $variant_id Bookable variant post ID.
 * @param array $date_range Optional date range with 'start' and 'end' (Y-m-d).
 *
 * @return array Availability data in standardized format.
 */
function get_effective_availability( $variant_id, $date_range = array() ) {
	return AvailabilityEngine::get_effective_availability( $variant_id, $date_range );
}
