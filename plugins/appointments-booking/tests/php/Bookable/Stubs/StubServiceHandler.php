<?php
/**
 * Stub service handler for tests
 *
 * @package WPAppointments
 */

namespace Tests\Bookable\Stubs;

use WP_Error;
use WPAppointments\Bookable\AbstractBookableTypeHandler;

/**
 * Stub service handler class
 */
class StubServiceHandler extends AbstractBookableTypeHandler {
	/**
	 * Get the type slug
	 *
	 * @return string
	 */
	public function get_slug() {
		return 'service';
	}

	/**
	 * Get the type label
	 *
	 * @return string
	 */
	public function get_label() {
		return 'Service';
	}

	/**
	 * Get additional meta fields for this type
	 *
	 * @return array
	 */
	public function get_fields() {
		return array(
			'duration' => array(
				'type'       => 'number',
				'label'      => 'Duration (min)',
				'default'    => 60,
				'required'   => true,
				'validation' => array( 'min' => 1 ),
			),
			'price'    => array(
				'type'    => 'number',
				'label'   => 'Price',
				'default' => 0,
			),
			'category' => array(
				'type'    => 'select',
				'label'   => 'Category',
				'default' => '',
				'options' => array(
					array(
						'value' => 'massage',
						'label' => 'Massage',
					),
					array(
						'value' => 'facial',
						'label' => 'Facial',
					),
				),
			),
		);
	}

	/**
	 * Get fields that support per-variant overrides
	 *
	 * @return array
	 */
	public function get_variant_overridable_fields() {
		return array( 'duration', 'price' );
	}

	/**
	 * Validate type-specific data
	 *
	 * @param array $data Data to validate.
	 *
	 * @return array|WP_Error
	 */
	public function validate( $data ) {
		if ( isset( $data['duration'] ) && $data['duration'] <= 0 ) {
			return new WP_Error( 'invalid_duration', 'Duration must be positive' );
		}

		return $data;
	}
}
