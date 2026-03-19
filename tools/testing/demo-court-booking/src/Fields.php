<?php
/**
 * Court-specific field definitions
 *
 * @package DemoCourtBooking
 * @since 0.1.0
 */

namespace DemoCourtBooking;

/**
 * Court field definitions
 *
 * Provides the field schema for the court bookable type.
 * Used by CourtType handler to register fields and validate data.
 */
class Fields {
	/**
	 * Valid surface types
	 *
	 * @var array
	 */
	const SURFACE_TYPES = array( 'clay', 'hard', 'grass', 'artificial' );

	/**
	 * Get court-specific field definitions
	 *
	 * @return array
	 */
	public static function get_definitions() {
		return array(
			'surface_type' => array( 'default' => 'hard' ),
			'indoor'       => array( 'default' => false ),
			'lighting'     => array( 'default' => false ),
			'max_players'  => array( 'default' => 4 ),
		);
	}
}
