<?php
/**
 * Schedules controller (/schedules endpoint)
 *
 * CRUD endpoints for schedule management. Handles weekly hours,
 * timezone, and default schedule designation.
 *
 * @package WPAppointments
 * @since 0.5.0
 */

namespace WPAppointments\Api\Endpoints;

use WP_Error;
use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Core\Capabilities;
use WPAppointments\Data\Model\Schedule;
use WPAppointments\Data\Query\ScheduleQuery;

/**
 * Schedules endpoint class
 */
class SchedulesController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::API_NAMESPACE,
			'/schedules',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_all_schedules' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_SETTINGS );
					},
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create_schedule' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_SETTINGS );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/schedules/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_schedule' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_SETTINGS );
					},
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update_schedule' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_SETTINGS );
					},
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( __CLASS__, 'delete_schedule' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_SETTINGS );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/schedules/(?P<id>\d+)/set-default',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'set_default' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_SETTINGS );
					},
				),
			)
		);
	}

	/**
	 * Get all schedules
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_all_schedules( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found -- Required by REST callback contract.
		$results = ScheduleQuery::all();

		$schedules = array_map(
			function ( $post ) {
				$model = new Schedule( $post );
				return $model->normalize();
			},
			$results['schedules']
		);

		$results['schedules'] = $schedules;

		return self::response(
			__( 'Schedules fetched successfully', 'wpappointments' ),
			self::paginated( 'schedules', $results )
		);
	}

	/**
	 * Create a schedule
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function create_schedule( $request ) {
		$data = self::sanitize_schedule_data( $request->get_json_params() );

		if ( empty( $data['name'] ) ) {
			return self::error(
				new WP_Error( 'schedule_name_required', __( 'Schedule name is required', 'wpappointments' ), array( 'status' => 422 ) )
			);
		}

		$model = new Schedule( $data );
		$saved = $model->save();

		if ( is_wp_error( $saved ) ) {
			return self::error( $saved );
		}

		// If this is the first schedule, make it the default.
		$default_id = get_option( 'wpappointments_default_scheduleId' );

		if ( ! $default_id ) {
			update_option( 'wpappointments_default_scheduleId', $saved->schedule->ID );
		}

		return self::response(
			__( 'Schedule created successfully', 'wpappointments' ),
			array( 'schedule' => $saved->normalize() )
		);
	}

	/**
	 * Get a single schedule
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_schedule( $request ) {
		$id    = absint( $request->get_param( 'id' ) );
		$model = new Schedule( $id );

		if ( is_wp_error( $model->schedule ) ) {
			return self::error( $model->schedule );
		}

		return self::response(
			__( 'Schedule fetched successfully', 'wpappointments' ),
			array( 'schedule' => $model->normalize() )
		);
	}

	/**
	 * Update a schedule
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function update_schedule( $request ) {
		$id   = absint( $request->get_param( 'id' ) );
		$data = self::sanitize_schedule_data( $request->get_json_params() );

		$model   = new Schedule( $id );
		$updated = $model->update( $data );

		if ( is_wp_error( $updated ) ) {
			return self::error( $updated );
		}

		return self::response(
			__( 'Schedule updated successfully', 'wpappointments' ),
			array( 'schedule' => $updated->normalize() )
		);
	}

	/**
	 * Delete a schedule
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function delete_schedule( $request ) {
		$id       = absint( $request->get_param( 'id' ) );
		$reassign = rest_sanitize_boolean( $request->get_param( 'reassign' ) ?? true );

		$model   = new Schedule( $id );
		$deleted = $model->delete( $reassign );

		if ( is_wp_error( $deleted ) ) {
			return self::error( $deleted );
		}

		return self::response(
			__( 'Schedule deleted successfully', 'wpappointments' ),
			array( 'id' => $deleted )
		);
	}

	/**
	 * Set a schedule as the default
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function set_default( $request ) {
		$id    = absint( $request->get_param( 'id' ) );
		$model = new Schedule( $id );

		if ( is_wp_error( $model->schedule ) ) {
			return self::error( $model->schedule );
		}

		update_option( 'wpappointments_default_scheduleId', $id );

		return self::response(
			__( 'Default schedule updated', 'wpappointments' ),
			array( 'schedule' => $model->normalize() )
		);
	}

	/**
	 * Sanitize schedule data from request JSON body
	 *
	 * @param array $data Raw request data.
	 *
	 * @return array Sanitized data.
	 */
	private static function sanitize_schedule_data( $data ) {
		$sanitized = array();

		if ( isset( $data['name'] ) ) {
			$sanitized['name'] = sanitize_text_field( $data['name'] );
		}

		if ( isset( $data['timezone'] ) ) {
			$tz = sanitize_text_field( $data['timezone'] );

			if ( in_array( $tz, timezone_identifiers_list(), true ) || '' === $tz ) {
				$sanitized['timezone'] = $tz;
			}
		}

		if ( isset( $data['days'] ) && is_array( $data['days'] ) ) {
			$sanitized['days'] = self::sanitize_days_data( $data['days'] );
		}

		return $sanitized;
	}

	/**
	 * Sanitize weekly days data
	 *
	 * @param array $days Raw days data.
	 *
	 * @return array Sanitized days data.
	 */
	private static function sanitize_days_data( $days ) {
		$sanitized  = array();
		$valid_days = array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' );

		foreach ( $valid_days as $day ) {
			if ( ! isset( $days[ $day ] ) || ! is_array( $days[ $day ] ) ) {
				continue;
			}

			$day_data = $days[ $day ];

			$sanitized[ $day ] = array(
				'enabled' => rest_sanitize_boolean( $day_data['enabled'] ?? false ),
				'allDay'  => rest_sanitize_boolean( $day_data['allDay'] ?? false ),
				'slots'   => array(
					'list' => array(),
				),
			);

			$slots = $day_data['slots']['list'] ?? array();

			if ( is_array( $slots ) ) {
				foreach ( $slots as $slot ) {
					if ( ! is_array( $slot ) ) {
						continue;
					}

					$sanitized[ $day ]['slots']['list'][] = array(
						'start' => array(
							'hour'   => self::sanitize_time_part( $slot['start']['hour'] ?? null, 24 ),
							'minute' => self::sanitize_time_part( $slot['start']['minute'] ?? null, 59 ),
						),
						'end'   => array(
							'hour'   => self::sanitize_time_part( $slot['end']['hour'] ?? null, 24 ),
							'minute' => self::sanitize_time_part( $slot['end']['minute'] ?? null, 59 ),
						),
					);
				}
			}

			// Normalize all-day.
			if ( $sanitized[ $day ]['allDay'] ) {
				$sanitized[ $day ]['slots']['list'] = array(
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
		}

		return $sanitized;
	}

	/**
	 * Sanitize a time part (hour or minute)
	 *
	 * @param mixed $value Raw value.
	 * @param int   $max   Maximum allowed value.
	 *
	 * @return string|null Sanitized value or null.
	 */
	private static function sanitize_time_part( $value, $max ) {
		if ( null === $value || '' === $value ) {
			return null;
		}

		$int_value = absint( $value );

		if ( $int_value > $max ) {
			$int_value = $max;
		}

		return str_pad( (string) $int_value, 2, '0', STR_PAD_LEFT );
	}
}
