<?php
/**
 * Availability engine class file
 *
 * Computes effective availability by walking through registered layers.
 * System defaults are fallbacks (replaced by more specific base layers).
 * Narrowing layers can only restrict the base, never widen it.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Availability;

/**
 * Availability engine class
 *
 * Availability data format:
 * ```php
 * [
 *     'weekly' => [
 *         'monday'    => [['start' => '09:00', 'end' => '17:00']],
 *         'tuesday'   => [['start' => '09:00', 'end' => '12:00'], ['start' => '13:00', 'end' => '17:00']],
 *         // ...
 *     ],
 *     'overrides' => [
 *         '2026-03-25' => [['start' => '10:00', 'end' => '14:00']], // special hours
 *         '2026-03-26' => [],  // closed this day
 *     ],
 * ]
 * ```
 */
class AvailabilityEngine {
	/**
	 * Days of the week keys
	 */
	const WEEKDAYS = array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' );

	/**
	 * Get effective availability for a variant
	 *
	 * Walks through all registered availability layers to compute
	 * the final effective availability for a given variant and date range.
	 *
	 * @param int   $variant_id Bookable variant post ID.
	 * @param array $date_range Array with 'start' and 'end' date strings (Y-m-d).
	 *
	 * @return array Availability data in standardized format.
	 */
	public static function get_effective_availability( $variant_id, $date_range = array() ) {
		$variant_post = get_post( $variant_id );

		if ( ! $variant_post ) {
			return self::empty_availability();
		}

		// Build context for layer callbacks.
		$context = array(
			'variant_id' => $variant_id,
			'entity_id'  => $variant_post->post_parent,
			'date_range' => $date_range,
		);

		// Get all registered layers sorted by priority.
		$layers = AvailabilityLayerRegistry::get_instance()->get_all();

		// Step 1: Determine the base availability.
		// Find the highest-priority base layer that returns data.
		// System defaults are the fallback; more specific base layers replace them.
		$base = null;

		foreach ( $layers as $slug => $layer ) {
			if ( 'base' !== $layer['type'] ) {
				continue;
			}

			$layer_data = call_user_func( $layer['callback'], $context );
			$layer_data = apply_filters( "wpappointments_availability_layer_{$slug}", $layer_data, $context );

			if ( null !== $layer_data && ! self::is_empty_availability( $layer_data ) ) {
				$base = $layer_data;
			}
		}

		if ( null === $base ) {
			$base = self::empty_availability();
		}

		// Step 2: Apply narrowing layers (intersection).
		$result = $base;

		foreach ( $layers as $slug => $layer ) {
			if ( 'narrowing' !== $layer['type'] ) {
				continue;
			}

			$layer_data = call_user_func( $layer['callback'], $context );
			$layer_data = apply_filters( "wpappointments_availability_layer_{$slug}", $layer_data, $context );

			// Skip layers that return no data (pass-through).
			if ( null === $layer_data || self::is_empty_availability( $layer_data ) ) {
				continue;
			}

			$result = self::intersect( $result, $layer_data );
		}

		return apply_filters( 'wpappointments_effective_availability', $result, $context );
	}

	/**
	 * Get availability for a specific date
	 *
	 * Resolves the weekly schedule and date-specific overrides for a given date.
	 *
	 * @param array  $availability Availability data.
	 * @param string $date         Date string (Y-m-d).
	 *
	 * @return array Array of time ranges for that date.
	 */
	public static function get_for_date( $availability, $date ) {
		// Check for date-specific override first.
		if ( isset( $availability['overrides'][ $date ] ) ) {
			return $availability['overrides'][ $date ];
		}

		// Fall back to weekly schedule.
		$weekday = strtolower( gmdate( 'l', strtotime( $date ) ) );

		return $availability['weekly'][ $weekday ] ?? array();
	}

	/**
	 * Intersect two availability datasets
	 *
	 * For each day, computes the overlapping time ranges.
	 * The result contains only time that exists in BOTH inputs.
	 *
	 * @param array $a First availability data.
	 * @param array $b Second availability data.
	 *
	 * @return array Intersected availability data.
	 */
	public static function intersect( $a, $b ) {
		$result = array(
			'weekly'    => array(),
			'overrides' => array(),
		);

		// Intersect weekly schedules.
		foreach ( self::WEEKDAYS as $day ) {
			$ranges_a = $a['weekly'][ $day ] ?? array();
			$ranges_b = $b['weekly'][ $day ] ?? array();

			$result['weekly'][ $day ] = self::intersect_ranges( $ranges_a, $ranges_b );
		}

		// Intersect date overrides.
		// Collect all dates that have overrides in either.
		$override_dates = array_unique(
			array_merge(
				array_keys( $a['overrides'] ?? array() ),
				array_keys( $b['overrides'] ?? array() )
			)
		);

		foreach ( $override_dates as $date ) {
			$ranges_a = self::get_for_date( $a, $date );
			$ranges_b = self::get_for_date( $b, $date );

			$result['overrides'][ $date ] = self::intersect_ranges( $ranges_a, $ranges_b );
		}

		return $result;
	}

	/**
	 * Intersect two sets of time ranges
	 *
	 * Given two arrays of {start, end} time ranges, returns only
	 * the overlapping portions.
	 *
	 * @param array $ranges_a First set of ranges.
	 * @param array $ranges_b Second set of ranges.
	 *
	 * @return array Overlapping ranges.
	 */
	public static function intersect_ranges( $ranges_a, $ranges_b ) {
		if ( empty( $ranges_a ) || empty( $ranges_b ) ) {
			return array();
		}

		$result = array();

		foreach ( $ranges_a as $a ) {
			foreach ( $ranges_b as $b ) {
				$start = max( self::time_to_minutes( $a['start'] ), self::time_to_minutes( $b['start'] ) );
				$end   = min( self::time_to_minutes( $a['end'] ), self::time_to_minutes( $b['end'] ) );

				if ( $start < $end ) {
					$result[] = array(
						'start' => self::minutes_to_time( $start ),
						'end'   => self::minutes_to_time( $end ),
					);
				}
			}
		}

		return $result;
	}

	/**
	 * Create an empty availability structure
	 *
	 * @return array
	 */
	public static function empty_availability() {
		$weekly = array();

		foreach ( self::WEEKDAYS as $day ) {
			$weekly[ $day ] = array();
		}

		return array(
			'weekly'    => $weekly,
			'overrides' => array(),
		);
	}

	/**
	 * Check if availability data is empty (no time ranges on any day)
	 *
	 * @param array $availability Availability data.
	 *
	 * @return bool
	 */
	public static function is_empty_availability( $availability ) {
		if ( empty( $availability ) ) {
			return true;
		}

		$weekly = $availability['weekly'] ?? array();

		foreach ( $weekly as $ranges ) {
			if ( ! empty( $ranges ) ) {
				return false;
			}
		}

		$overrides = $availability['overrides'] ?? array();

		foreach ( $overrides as $ranges ) {
			if ( ! empty( $ranges ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Convert time string (HH:MM) to minutes since midnight
	 *
	 * @param string $time Time string.
	 *
	 * @return int
	 */
	public static function time_to_minutes( $time ) {
		$parts = explode( ':', $time );
		return (int) $parts[0] * 60 + (int) ( $parts[1] ?? 0 );
	}

	/**
	 * Convert minutes since midnight to time string (HH:MM)
	 *
	 * @param int $minutes Minutes since midnight.
	 *
	 * @return string
	 */
	public static function minutes_to_time( $minutes ) {
		$hours = (int) floor( $minutes / 60 );
		$mins  = $minutes % 60;
		return sprintf( '%02d:%02d', $hours, $mins );
	}
}
