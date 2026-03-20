<?php
/**
 * Maintenance Block availability layer
 *
 * Narrowing layer that blocks Tuesday mornings (07:00–12:00) for court
 * maintenance. Intersects with the base layer to remove those hours.
 *
 * @package DemoCourtBooking
 * @since 0.1.0
 */

namespace DemoCourtBooking;

/**
 * Maintenance Block layer class
 */
class MaintenanceBlockLayer {
	/**
	 * Layer callback
	 *
	 * Returns availability that excludes Tuesday 07:00–12:00.
	 * All other times pass through unchanged (full-day ranges).
	 * Returns null for non-court entities (pass-through).
	 *
	 * @param array $context Layer context with variant_id, entity_id, date_range.
	 *
	 * @return array|null Availability data or null.
	 */
	public static function callback( $context ) {
		$entity_id = $context['entity_id'] ?? 0;

		if ( ! $entity_id ) {
			return null;
		}

		$type = get_post_meta( $entity_id, 'type', true );

		if ( 'court' !== $type ) {
			return null;
		}

		$all_day = array(
			array(
				'start' => '00:00',
				'end'   => '23:59',
			),
		);

		// Tuesday: only available 12:00–23:59 (maintenance blocks 07:00–12:00).
		$tuesday_after_maintenance = array(
			array(
				'start' => '12:00',
				'end'   => '23:59',
			),
		);

		return array(
			'weekly'    => array(
				'monday'    => $all_day,
				'tuesday'   => $tuesday_after_maintenance,
				'wednesday' => $all_day,
				'thursday'  => $all_day,
				'friday'    => $all_day,
				'saturday'  => $all_day,
				'sunday'    => $all_day,
			),
			'overrides' => array(),
		);
	}
}
