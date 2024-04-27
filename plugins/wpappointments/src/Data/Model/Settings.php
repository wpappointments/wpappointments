<?php
/**
 * Plugin settings model file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Data\Model;

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
				'name' => 'startOfWeek',
				'type' => 'string',
			),
			array(
				'name' => 'clockType',
				'type' => 'string',
			),
			array(
				'name' => 'timezoneSiteDefault',
				'type' => 'boolean',
			),
			array(
				'name' => 'timezone',
				'type' => 'string',
			),
			array(
				'name' => 'dateFormat',
				'type' => 'string',
			),
			array(
				'name' => 'timeFormat',
				'type' => 'string',
			),
			array(
				'name' => 'customDateFormat',
				'type' => 'string',
			),
			array(
				'name' => 'customTimeFormat',
				'type' => 'string',
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
			array(
				'name' => 'defaultStatus',
				'type' => 'string',
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
		$category_exists = array_key_exists( $category, $this->settings );
		$category        = $category ? sprintf( '%s_', $category ) : '';

		if ( $category_exists ) {
			foreach ( $settings as $key => $value ) {
				update_option( 'wpappointments_' . $category . $key, $value );
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

				if ( 'boolean' === $type ) {
					$option = filter_var( $option, FILTER_VALIDATE_BOOLEAN );
				}

				if ( $option ) {
					$settings[ $category ][ $name ] = $option;
				}
			}
		}

		$schedule             = $this->get_default_schedule( get_option( 'wpappointments_default_scheduleId' ) );
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
					$hours[ $day ] = json_decode( $meta, true );
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
	public function get_all_by_category( $category ) {
		$settings = array();

		if ( true === array_key_exists( $category, $this->settings ) ) {
			foreach ( $this->settings[ $category ] as $option ) {
				$name   = $option['name'];
				$type   = $option['type'];
				$option = get_option( 'wpappointments_' . $category . '_' . $name );

				if ( 'number' === $type ) {
					$option = intval( $option );
				}

				if ( 'boolean' === $type ) {
					$option = filter_var( $option, FILTER_VALIDATE_BOOLEAN );
				}

				if ( $option ) {
					$settings[ $name ] = $option;
				}
			}
		}

		return $settings;
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

	/**
	 * Get setting by category and name
	 *
	 * @param string      $category Settings category ('general', 'schedules').
	 * @param string|null $name Setting key.
	 *
	 * @return array
	 */
	public function get_setting( $category, $name = null ) {
		$option = $this->get( 'wpappointments_' . $category . '_' . $name );

		return $option;
	}

	/**
	 * Update setting
	 *
	 * @param string $category Settings category ('general', 'schedules').
	 * @param string $name Setting key.
	 * @param mixed  $value Setting value.
	 *
	 * @return mixed
	 */
	public function update_setting( $category, $name, $value ) {
		update_option( 'wpappointments_' . $category . '_' . $name, $value );

		return $this->get_setting( $category, $name );
	}
}
