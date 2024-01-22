<?php
/**
 * Plugin settings model file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Model;

use WPAppointments\Core;

const DAY_OPENING_OPTIONS = array(
	'enabled',
	'startTime' => array(
		'hour',
		'minute',
	),
	'endTime'   => array(
		'hour',
		'minute',
	),
);

/**
 * Plugin settings model class
 */
class Settings {
	/**
	 * Settings
	 *
	 * @var array
	 */
	public $settings = array(
		'general'      => array(
			array(
				'name' => 'firstName',
				'type' => 'string',
			),
			array(
				'name' => 'lastName',
				'type' => 'string',
			),
			array(
				'name' => 'phoneNumber',
				'type' => 'string',
			),
			array(
				'name' => 'companyName',
				'type' => 'string',
			),
			array(
				'name' => 'clockType',
				'type' => 'number',
			),
		),
		'appointments' => array(
			array(
				'name' => 'defaultLength',
				'type' => 'number',
			),
			array(
				'name' => 'timePickerPrecision',
				'type' => 'number',
			),
		),
		'calendar'     => array(),
	);

	/**
	 * Update settings
	 *
	 * @param string $category Settings category ('general', 'schedules').
	 * @param array  $settings Settings to update.
	 *
	 * @return array
	 */
	public function update( $category, $settings = array() ) {
		$_category = $category ? $category . '_' : '';

		foreach ( $settings as $key => $value ) {
			update_option( 'wpappointments_' . $_category . $key, $value );
		}

		return $this->get_all();
	}

	/**
	 * Get all plugin settings
	 *
	 * @return array
	 */
	public function get_all() {
		$settings = array();

		// return $this->settings;

		foreach ( $this->settings as $category => $options ) {
			foreach ( $options as $option ) {
				$name   = $option['name'];
				$type   = $option['type'];
				$option = get_option( 'wpappointments_' . $category . '_' . $name );

				if ( 'number' === $type ) {
					$option = intval( $option );
				}

				if ( $option ) {
					$settings[ $category ][ $name ] = $option;
				}
			}
		}

		$schedule             = $this->get_default_schedule( get_option( 'wpappointments_default_schedule_id' ) );
		$settings['schedule'] = $schedule['schedule'];

		return $settings;
	}

	/**
	 * Get default schedule settings
	 *
	 * @param int $schedule_post_id Default schedule post ID.
	 *
	 * @return array
	 */
	public function get_default_schedule( $schedule_post_id ) {
		$settings = array();

		if ( $schedule_post_id ) {
			$hours = array();

			foreach ( array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ) as $day ) {
				$meta = get_post_meta( $schedule_post_id, 'wpappointments_schedule_' . $day, true );

				if ( $meta ) {
					$hours[ $day ] = json_decode( $meta );
				}
			}

			$settings['schedule'] = (object) $hours;
		}

		return $settings;
	}

	/**
	 * Get settings by category
	 *
	 * @param string $category Settings category ('general', 'schedules').
	 *
	 * @return array
	 */
	public function get_by_category( $category ) {
		return $category;  // TODO: Implement.
	}

	/**
	 * Get plugin setting
	 *
	 * @param string $key Setting key.
	 *
	 * @return mixed
	 */
	public function get( $key ) {
		return get_option( $key );
	}
}
