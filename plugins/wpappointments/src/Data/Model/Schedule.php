<?php
/**
 * Schedule model file
 *
 * Wraps the wpa-schedule custom post type with CRUD operations,
 * normalization, and weekly hours + timezone management.
 *
 * @package WPAppointments
 * @since 0.5.0
 */

namespace WPAppointments\Data\Model;

use WP_Error;
use WP_Post;
use WPAppointments\Core\PluginInfo;

/**
 * Schedule model class
 */
class Schedule {
	const FIELDS = array(
		'name',
		'timezone',
	);

	const DAYS = array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' );

	/**
	 * Schedule post
	 *
	 * @var WP_Post|WP_Error|null
	 */
	public $schedule;

	/**
	 * Schedule data array
	 *
	 * @var array
	 */
	public $schedule_data = array();

	/**
	 * Schedule model constructor
	 *
	 * @param WP_Post|int|array|string $schedule Schedule post object, ID, or data array.
	 */
	public function __construct( $schedule ) {
		if ( $schedule instanceof WP_Post ) {
			if ( PluginInfo::POST_TYPES['schedule'] !== $schedule->post_type ) {
				$this->schedule = new WP_Error(
					'schedule_invalid_post_type',
					__( 'Post is not a schedule. Expected post_type wpa-schedule', 'wpappointments' )
				);
				return;
			}
			$this->schedule = $schedule;
		} elseif ( is_array( $schedule ) ) {
			$this->parse_schedule_data( $schedule );
		} elseif ( is_int( $schedule ) || is_string( $schedule ) ) {
			$this->parse_schedule_from_id( $schedule );
		} elseif ( is_null( $schedule ) ) {
			$this->schedule = new WP_Error(
				'schedule_cannot_be_null',
				__( 'Schedule value passed to constructor cannot be null', 'wpappointments' )
			);
		} else {
			$this->schedule = new WP_Error(
				'schedule_invalid_type',
				__( 'Schedule value passed to constructor is invalid. Expected array, int, string or WP_Post', 'wpappointments' )
			);
		}
	}

	/**
	 * Create schedule
	 *
	 * @return Schedule|WP_Error
	 */
	public function save() {
		if ( is_wp_error( $this->schedule ) ) {
			return $this->schedule;
		}

		if ( $this->schedule instanceof WP_Post ) {
			return new WP_Error(
				'schedule_already_persisted',
				__( 'This schedule is already persisted. Use update() instead', 'wpappointments' )
			);
		}

		$title    = $this->schedule_data['name'] ?? '';
		$timezone = $this->schedule_data['timezone'] ?? '';
		$days     = $this->schedule_data['days'] ?? array();

		// Default to the site timezone if none specified.
		if ( '' === $timezone ) {
			$timezone = wp_timezone_string();
		}

		$post_id = wp_insert_post(
			array(
				'post_type'   => PluginInfo::POST_TYPES['schedule'],
				'post_status' => 'publish',
				'post_title'  => $title,
				'meta_input'  => array(
					'wpappointments_schedule_timezone' => $timezone,
				),
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		// Save per-day schedule data.
		foreach ( self::DAYS as $day ) {
			if ( isset( $days[ $day ] ) ) {
				update_post_meta(
					$post_id,
					'wpappointments_schedule_' . $day,
					wp_json_encode( $days[ $day ] )
				);
			}
		}

		// Save overrides.
		$overrides = $this->schedule_data['overrides'] ?? array();
		update_post_meta( $post_id, 'wpappointments_schedule_overrides', wp_json_encode( $overrides ) );

		$this->schedule_data['id'] = $post_id;
		$this->schedule            = get_post( $post_id );

		do_action( 'wpappointments_schedule_created', $this->normalize() );

		return $this;
	}

	/**
	 * Update schedule
	 *
	 * @param array $data Schedule update data.
	 *
	 * @return Schedule|WP_Error
	 */
	public function update( $data ) {
		if ( is_wp_error( $this->schedule ) ) {
			return $this->schedule;
		}

		if ( ! $this->schedule ) {
			return new WP_Error(
				'schedule_object_expected',
				__( 'Schedule not found. Instantiate Schedule class with a schedule object', 'wpappointments' )
			);
		}

		$id        = $this->schedule->ID;
		$post_data = array( 'ID' => $id );

		if ( isset( $data['name'] ) ) {
			$post_data['post_title'] = $data['name'];
		}

		$result = wp_update_post( $post_data, true );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( isset( $data['timezone'] ) ) {
			update_post_meta( $id, 'wpappointments_schedule_timezone', $data['timezone'] );
		}

		// Update per-day schedule data.
		if ( isset( $data['days'] ) && is_array( $data['days'] ) ) {
			foreach ( self::DAYS as $day ) {
				if ( isset( $data['days'][ $day ] ) ) {
					update_post_meta(
						$id,
						'wpappointments_schedule_' . $day,
						wp_json_encode( $data['days'][ $day ] )
					);
				}
			}
		}

		// Update overrides.
		if ( isset( $data['overrides'] ) ) {
			update_post_meta( $id, 'wpappointments_schedule_overrides', wp_json_encode( $data['overrides'] ) );
		}

		$this->schedule = get_post( $id );

		do_action( 'wpappointments_schedule_updated', $this->normalize() );

		return $this;
	}

	/**
	 * Delete schedule
	 *
	 * @param bool $reassign Whether to reassign entities to default schedule.
	 *
	 * @return int|WP_Error
	 */
	public function delete( $reassign = true ) {
		if ( is_wp_error( $this->schedule ) ) {
			return $this->schedule;
		}

		if ( ! $this->schedule ) {
			return new WP_Error(
				'schedule_object_expected',
				__( 'Schedule not found', 'wpappointments' )
			);
		}

		$id = $this->schedule->ID;

		// Prevent deletion of the default schedule.
		$default_id = get_option( 'wpappointments_default_scheduleId' );

		if ( absint( $default_id ) === $id ) {
			return new WP_Error(
				'schedule_cannot_delete_default',
				__( 'Cannot delete the default schedule', 'wpappointments' ),
				array( 'status' => 422 )
			);
		}

		// Handle entities using this schedule.
		$entities = get_posts(
			array(
				'post_type'      => PluginInfo::POST_TYPES['bookable'],
				'posts_per_page' => -1,
				'meta_key'       => 'schedule_id',
				'meta_value'     => $id,
			)
		);

		foreach ( $entities as $entity ) {
			if ( $reassign && $default_id ) {
				update_post_meta( $entity->ID, 'schedule_id', absint( $default_id ) );
			} else {
				delete_post_meta( $entity->ID, 'schedule_id' );
			}
		}

		$deleted = wp_delete_post( $id, true );

		if ( ! $deleted ) {
			return new WP_Error(
				'schedule_delete_failed',
				__( 'Failed to delete schedule', 'wpappointments' )
			);
		}

		do_action( 'wpappointments_schedule_deleted', $id );

		$this->schedule      = null;
		$this->schedule_data = array();

		return $id;
	}

	/**
	 * Normalize schedule object
	 *
	 * @param callable|null $normalizer Normalizer function.
	 *
	 * @return mixed
	 */
	public function normalize( $normalizer = null ) {
		if ( ! $normalizer ) {
			$normalizer = array( __CLASS__, 'default_normalizer' );
		}

		return call_user_func( $normalizer, $this );
	}

	/**
	 * Default normalizer
	 *
	 * @param Schedule $data Schedule model object.
	 *
	 * @return array
	 */
	public static function default_normalizer( $data ) {
		$post = $data->schedule;

		if ( is_wp_error( $post ) || ! $post ) {
			return array();
		}

		$id         = $post->ID;
		$timezone   = get_post_meta( $id, 'wpappointments_schedule_timezone', true );
		$default_id = get_option( 'wpappointments_default_scheduleId' );

		$days = array();

		foreach ( self::DAYS as $day ) {
			$meta_key = 'wpappointments_schedule_' . $day;
			$day_data = get_post_meta( $id, $meta_key, true );

			if ( is_string( $day_data ) && '' !== $day_data ) {
				$day_data = json_decode( $day_data, true );
			}

			if ( ! is_array( $day_data ) ) {
				$day_data = self::empty_day( $day );
			}

			$day_data['day'] = $day;
			$days[ $day ]    = $day_data;
		}

		$overrides_raw = get_post_meta( $id, 'wpappointments_schedule_overrides', true );
		$overrides     = array();

		if ( is_string( $overrides_raw ) && '' !== $overrides_raw ) {
			$decoded = json_decode( $overrides_raw, true );

			if ( is_array( $decoded ) ) {
				$overrides = $decoded;
			}
		}

		return array(
			'id'        => $id,
			'name'      => $post->post_title,
			'timezone'  => is_string( $timezone ) ? $timezone : '',
			'isDefault' => absint( $default_id ) === $id,
			'days'      => $days,
			'overrides' => $overrides,
		);
	}

	/**
	 * Get empty day structure
	 *
	 * @param string $day Day name.
	 *
	 * @return array
	 */
	public static function empty_day( $day ) {
		return array(
			'day'     => $day,
			'enabled' => false,
			'allDay'  => false,
			'slots'   => array(
				'list' => array(
					array(
						'start' => array(
							'hour'   => null,
							'minute' => null,
						),
						'end'   => array(
							'hour'   => null,
							'minute' => null,
						),
					),
				),
			),
		);
	}

	/**
	 * Parse schedule data from array
	 *
	 * @param array $schedule_data Schedule data.
	 */
	private function parse_schedule_data( $schedule_data ) {
		$data = $this->validate_schedule_data( $schedule_data );

		if ( is_wp_error( $data ) ) {
			$this->schedule = $data;
			return;
		}

		$this->schedule_data = wp_parse_args(
			$data,
			array(
				'name'     => '',
				'timezone' => '',
				'days'     => array(),
			)
		);
	}

	/**
	 * Parse schedule from ID
	 *
	 * @param int|string $id Schedule ID.
	 */
	private function parse_schedule_from_id( $id ) {
		$valid_id = $this->validate_post_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			$this->schedule = $valid_id;
		} else {
			$this->schedule = get_post( $valid_id );
		}
	}

	/**
	 * Validate post ID
	 *
	 * @param int|string $post_id Post ID.
	 *
	 * @return int|WP_Error
	 */
	private function validate_post_id( $post_id ) {
		if ( ! $post_id ) {
			return new WP_Error( 'schedule_id_required', __( 'Schedule ID is required', 'wpappointments' ) );
		}

		$post = get_post( $post_id );

		if ( ! $post ) {
			return new WP_Error( 'schedule_not_found', __( 'Schedule not found', 'wpappointments' ) );
		}

		if ( PluginInfo::POST_TYPES['schedule'] !== $post->post_type ) {
			return new WP_Error( 'schedule_invalid_type', __( 'Post is not a schedule', 'wpappointments' ) );
		}

		return absint( $post_id );
	}

	/**
	 * Validate schedule data
	 *
	 * @param array $data Schedule data.
	 *
	 * @return array|WP_Error
	 */
	private function validate_schedule_data( $data ) {
		if ( ! isset( $data['name'] ) || '' === trim( $data['name'] ) ) {
			return new WP_Error( 'schedule_name_required', __( 'Schedule name is required', 'wpappointments' ) );
		}

		return $data;
	}
}
