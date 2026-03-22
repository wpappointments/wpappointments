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
		'general'       => array(
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
				'name'    => 'startOfWeek',
				'type'    => 'string',
				'allowed' => array( '0', '1', '2', '3', '4', '5', '6' ),
			),
			array(
				'name'    => 'clockType',
				'type'    => 'string',
				'allowed' => array( '12', '24', '12h', '24h' ),
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
				'name'    => 'dateFormat',
				'type'    => 'string',
				'allowed' => array( 'F j, Y', 'Y-m-d', 'm/d/Y', 'd/m/Y' ),
			),
			array(
				'name'    => 'timeFormat',
				'type'    => 'string',
				'allowed' => array( 'g:i a', 'g:i A', 'H:i' ),
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
		'appointments'  => array(
			array(
				'name' => 'serviceName',
				'type' => 'string',
			),
			array(
				'name' => 'defaultLength',
				'type' => 'number',
				'min'  => 1,
				'max'  => 1440,
			),
			array(
				'name' => 'timePickerPrecision',
				'type' => 'number',
				'min'  => 1,
				'max'  => 60,
			),
			array(
				'name'    => 'defaultStatus',
				'type'    => 'string',
				'allowed' => array( 'pending', 'confirmed' ),
			),
			array(
				'name' => 'minLeadTime',
				'type' => 'number',
			),
			array(
				'name' => 'maxLeadTime',
				'type' => 'number',
			),
		),
		'calendar'      => array(),
		'schedule'      => array(),
		'notifications' => array(
			array(
				'name' => 'created',
				'type' => 'array',
			),
			array(
				'name' => 'updated',
				'type' => 'array',
			),
			array(
				'name' => 'confirmed',
				'type' => 'array',
			),
			array(
				'name' => 'cancelled',
				'type' => 'array',
			),
		),
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

		if ( ! $category_exists ) {
			return new \WP_Error( 'invalid_settings_category', __( 'Invalid settings category', 'wpappointments' ) );
		}

		$schedule = array();

		if ( 'schedule' === $category ) {
			$schedule_post_id = get_option( 'wpappointments_default_scheduleId' );

			if ( $schedule_post_id ) {
				foreach ( array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ) as $day ) {
					$settings[ $day ]['allDay']  = rest_sanitize_boolean( $settings[ $day ]['allDay'] ?? false );
					$settings[ $day ]['enabled'] = rest_sanitize_boolean( $settings[ $day ]['enabled'] ?? false );

					$slots         = $settings[ $day ]['slots']['list'] ?? array();
					$is_manual_24h = false;

					// Sanitize slot time values.
					foreach ( $slots as &$slot ) {
						$slot['start']['hour']   = self::sanitize_time_part( $slot['start']['hour'] ?? '00', 24 );
						$slot['start']['minute'] = self::sanitize_time_part( $slot['start']['minute'] ?? '00', 59 );
						$slot['end']['hour']     = self::sanitize_time_part( $slot['end']['hour'] ?? '00', 24 );
						$slot['end']['minute']   = self::sanitize_time_part( $slot['end']['minute'] ?? '00', 59 );
					}
					unset( $slot );

					$settings[ $day ]['slots']['list'] = $slots;

					if ( ! empty( $slots ) ) {
						$first_slot    = $slots[0];
						$is_start_zero = '00' === $first_slot['start']['hour'] && '00' === $first_slot['start']['minute'];
						$is_end_full   = ( '24' === $first_slot['end']['hour'] || '00' === $first_slot['end']['hour'] ) && '00' === $first_slot['end']['minute'];

						if ( $is_start_zero && $is_end_full && 1 === count( $slots ) ) {
							$is_manual_24h = true;
						}
					}

					if ( $settings[ $day ]['allDay'] || $is_manual_24h ) {
						$settings[ $day ]['allDay']        = true;
						$settings[ $day ]['slots']['list'] = array(
							array(
								'start' => array(
									'hour'   => '00',
									'minute' => '00',
								),
								'end'   => array(
									'hour'   => '24',
									'minute' => '00',
								),
							),
						);
					}

					$day_schedule = wp_json_encode( $settings[ $day ] );
					update_post_meta( $schedule_post_id, 'wpappointments_schedule_' . $day, $day_schedule );
					array_push( $schedule, $day_schedule );
				}
			}

			return $schedule;
		}

		$updated = array();

		// Build list of allowed setting names for this category.
		$allowed_keys = array_map(
			function ( $option ) {
				return $option['name'];
			},
			$this->settings[ $category ]
		);

		if ( $category_exists ) {
			foreach ( $settings as $key => $value ) {
				// Skip keys not defined in the settings schema.
				if ( ! in_array( $key, $allowed_keys, true ) ) {
					continue;
				}

				// Sanitize and validate value based on schema type.
				$option_def = $this->get_option_definition( $category, $key );

				if ( $option_def ) {
					$value = self::sanitize_setting_value( $value, $option_def );

					// Skip values that failed safelist validation.
					if ( null === $value ) {
						continue;
					}
				}

				update_option( 'wpappointments_' . $category . '_' . $key, $value );
				$updated[ $key ] = $value;
			}

			return $updated;
		}

		return new \WP_Error( 'unknown_settings_error', __( 'Unknown error while saving settings', 'wpappointments' ) );
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

				if ( 'array' === $type && ! is_array( $option ) ) {
					continue;
				}

				if ( $option ) {
					$settings[ $category ][ $name ] = $option;
				}
			}
		}

		$schedule = $this->get_default_schedule();

		if ( $schedule ) {
			$settings['schedule'] = $schedule;
		}

		return $settings;
	}

	/**
	 * Get default schedule settings
	 *
	 * @return array|null
	 */
	public function get_default_schedule() {
		$schedule_post_id = get_option( 'wpappointments_default_scheduleId' );
		$schedule         = null;

		if ( $schedule_post_id ) {
			$hours = array();

			foreach ( array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ) as $day ) {
				$meta = get_post_meta( $schedule_post_id, 'wpappointments_schedule_' . $day, true );

				if ( $meta ) {
					$hours[ $day ] = json_decode( $meta, true );
				}
			}

			$schedule = $hours;
		}

		return $schedule;
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

				if ( 'array' === $type ) {
					if ( ! is_array( $option ) ) {
						continue;
					}
				} elseif ( ! $option ) {
					continue;
				}

				if ( 'number' === $type ) {
					$option = intval( $option );
				}

				if ( 'boolean' === $type ) {
					$option = filter_var( $option, FILTER_VALIDATE_BOOLEAN );
				}

				$settings[ $name ] = $option;
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

	/**
	 * Get the option definition for a setting key within a category
	 *
	 * @param string $category Settings category.
	 * @param string $key Setting key name.
	 *
	 * @return array|null Option definition array or null if not found.
	 */
	private function get_option_definition( $category, $key ) {
		if ( ! isset( $this->settings[ $category ] ) ) {
			return null;
		}

		foreach ( $this->settings[ $category ] as $option ) {
			if ( $option['name'] === $key ) {
				return $option;
			}
		}

		return null;
	}

	/**
	 * Sanitize a setting value based on its schema definition
	 *
	 * @param mixed $value Raw value.
	 * @param array $option_def Option definition from settings schema.
	 *
	 * @return mixed Sanitized value.
	 */
	private static function sanitize_setting_value( $value, $option_def ) {
		$type = $option_def['type'] ?? 'string';

		switch ( $type ) {
			case 'string':
				$value = sanitize_text_field( (string) $value );

				// Validate against allowed values safelist.
				if ( isset( $option_def['allowed'] ) && ! in_array( $value, $option_def['allowed'], true ) ) {
					return null;
				}

				return $value;

			case 'number':
				$value = intval( $value );

				if ( isset( $option_def['min'] ) && $value < $option_def['min'] ) {
					return $option_def['min'];
				}

				if ( isset( $option_def['max'] ) && $value > $option_def['max'] ) {
					return $option_def['max'];
				}

				return $value;

			case 'boolean':
				return rest_sanitize_boolean( $value );

			case 'array':
				return is_array( $value ) ? self::sanitize_setting_array( $value ) : array();

			default:
				return sanitize_text_field( (string) $value );
		}
	}

	/**
	 * Recursively sanitize a settings array (e.g. notification templates)
	 *
	 * @param array $data Array to sanitize.
	 *
	 * @return array Sanitized array.
	 */
	private static function sanitize_setting_array( $data ) {
		$sanitized = array();

		foreach ( $data as $key => $value ) {
			$key = sanitize_key( $key );

			if ( is_array( $value ) ) {
				$sanitized[ $key ] = self::sanitize_setting_array( $value );
			} elseif ( is_bool( $value ) ) {
				$sanitized[ $key ] = (bool) $value;
			} elseif ( is_int( $value ) ) {
				$sanitized[ $key ] = (int) $value;
			} else {
				$sanitized[ $key ] = sanitize_textarea_field( (string) $value );
			}
		}

		return $sanitized;
	}

	/**
	 * Sanitize a time component (hour or minute) string
	 *
	 * @param string $value Raw time string.
	 * @param int    $max Maximum allowed value (24 for hours, 59 for minutes).
	 *
	 * @return string Zero-padded two-digit time string.
	 */
	private static function sanitize_time_part( $value, $max ) {
		$value   = sanitize_text_field( $value );
		$numeric = absint( $value );

		if ( $numeric > $max ) {
			$numeric = 0;
		}

		return str_pad( (string) $numeric, 2, '0', STR_PAD_LEFT );
	}
}
