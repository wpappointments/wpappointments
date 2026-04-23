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
			'surface_type' => array(
				'type'     => 'select',
				'label'    => 'Surface Type',
				'default'  => 'hard',
				'required' => true,
				'options'  => array(
					array(
						'value' => 'hard',
						'label' => 'Hard Court',
					),
					array(
						'value' => 'clay',
						'label' => 'Clay',
					),
					array(
						'value' => 'grass',
						'label' => 'Grass',
					),
					array(
						'value' => 'artificial',
						'label' => 'Artificial',
					),
				),
			),
			'indoor'       => array(
				'type'    => 'toggle',
				'label'   => 'Indoor',
				'default' => false,
				'help'    => 'Whether the court is indoors.',
			),
			'lighting'     => array(
				'type'    => 'toggle',
				'label'   => 'Lighting',
				'default' => false,
				'help'    => 'Whether the court has floodlights.',
			),
			'max_players'  => array(
				'type'       => 'number',
				'label'      => 'Max Players',
				'default'    => 4,
				'required'   => true,
				'validation' => array(
					'min' => 1,
					'max' => 20,
				),
			),
		);
	}
}
