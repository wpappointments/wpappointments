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
				'name' => 'email',
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
	 * @return array|\WP_Error
	 */
	public function update( $category, $settings = array() ) {
		$_category = $category ? $category . '_' : '';

		if ( true === array_key_exists( $category, $this->settings ) ) {
			foreach ( $settings as $key => $value ) {
				update_option( 'wpappointments_' . $_category . $key, $value );
			}

			return $this->get_all();
		}

		return new \WP_Error( 'invalid_category', 'Invalid category' );
	}

	/**
	 * Get all plugin settings
	 *
	 * @return array
	 */
	public function get_all() {
		$settings = array();

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
		$settings['schedule'] = $schedule;

		$service                                 = $this->get_default_service( get_option( 'wpappointments_defaultServiceId' ) );
		$settings['appointments']['service']     = $service;
		$settings['appointments']['serviceName'] = $service->post_title;

		return $settings;
	}

	/**
	 * Get default schedule settings
	 *
	 * @param int $schedule_post_id Default schedule post ID.
	 *
	 * @return null|\WP_Post
	 */
	public function get_default_schedule( $schedule_post_id ) {
		$schedule = null;

		if ( $schedule_post_id ) {
			$hours = array();

			foreach ( array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ) as $day ) {
				$meta = get_post_meta( $schedule_post_id, 'wpappointments_schedule_' . $day, true );

				if ( $meta ) {
					$hours[ $day ] = json_decode( $meta );
				}
			}

			$schedule = (object) $hours;
		}

		return $schedule;
	}

	/**
	 * Get default service settings
	 *
	 * @param string $service_post_id Default service post ID.
	 *
	 * @return null|\WP_Post
	 */
	public function get_default_service( $service_post_id ) {
		$service = null;

		if ( $service_post_id ) {
			$service = get_post( $service_post_id );
		}

		return $service;
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
