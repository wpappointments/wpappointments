<?php
/**
 * Holidays controller (/holidays endpoint)
 *
 * Endpoints for managing holiday groups: available sets, group CRUD,
 * and individual holiday listing with dates.
 *
 * Pagination: holiday responses intentionally omit the standard
 * totalItems/totalPages/postsPerPage/currentPage envelope. Holidays
 * are bounded sets — at most ~50 groups and ~365 dates per year per
 * group — and the UI renders all of them at once. Adding pagination
 * here would force the client to issue extra round-trips for data
 * that already fits in a single response.
 *
 * @package WPAppointments
 * @since 0.6.0
 */

namespace WPAppointments\Api\Endpoints;

use WP_Error;
use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Core\Capabilities;
use WPAppointments\Holidays\HolidayRegistry;
use WPAppointments\Holidays\HolidayResolver;

/**
 * Holidays endpoint class
 */
class HolidaysController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::API_NAMESPACE,
			'/holidays/available',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_available' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::VIEW_SETTINGS );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/holidays/groups',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_groups' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::VIEW_SETTINGS );
					},
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'add_group' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::EDIT_SETTINGS );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/holidays/groups/(?P<id>[a-zA-Z0-9_-]+)',
			array(
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( __CLASS__, 'remove_group' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::EDIT_SETTINGS );
					},
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update_group' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::EDIT_SETTINGS );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/holidays/groups/(?P<id>[a-zA-Z0-9_-]+)/holidays',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_group_holidays' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::VIEW_SETTINGS );
					},
				),
			)
		);
	}

	/**
	 * Get available country and religious holiday sets
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_available( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found -- Required by REST callback contract.
		return self::response(
			__( 'Available holiday sets fetched successfully', 'appointments-booking' ),
			array(
				'countries' => HolidayRegistry::get_available_countries(),
				'religious' => HolidayRegistry::get_available_religious(),
			)
		);
	}

	/**
	 * Get saved holiday groups
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_groups( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found -- Required by REST callback contract.
		return self::response(
			__( 'Holiday groups fetched successfully', 'appointments-booking' ),
			array( 'groups' => HolidayRegistry::get_groups_with_holidays() )
		);
	}

	/**
	 * Add a holiday group
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function add_group( $request ) {
		$params = $request->get_json_params();

		$data = array(
			'type'    => sanitize_text_field( $params['type'] ?? '' ),
			'file_id' => sanitize_file_name( $params['file_id'] ?? '' ),
		);

		$result = HolidayRegistry::add_group( $data );

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		return self::response(
			__( 'Holiday group added successfully', 'appointments-booking' ),
			array( 'groups' => HolidayRegistry::get_groups_with_holidays() )
		);
	}

	/**
	 * Remove a holiday group
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function remove_group( $request ) {
		$group_id = sanitize_text_field( $request->get_param( 'id' ) );
		$result   = HolidayRegistry::remove_group( $group_id );

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		return self::response(
			__( 'Holiday group removed successfully', 'appointments-booking' ),
			array( 'groups' => HolidayRegistry::get_groups_with_holidays() )
		);
	}

	/**
	 * Update a holiday group (toggle enabled, update excluded holidays)
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function update_group( $request ) {
		$group_id = sanitize_text_field( $request->get_param( 'id' ) );
		$params   = $request->get_json_params();

		// Toggle group enabled/disabled.
		if ( null !== ( $params['enabled'] ?? null ) ) {
			$enabled = rest_sanitize_boolean( $params['enabled'] );
			$result  = HolidayRegistry::toggle_group( $group_id, $enabled );

			if ( is_wp_error( $result ) ) {
				return self::error( $result );
			}

			return self::response(
				__( 'Holiday group updated successfully', 'appointments-booking' ),
				array( 'groups' => HolidayRegistry::get_groups_with_holidays() )
			);
		}

		// Toggle individual holiday (with cascade on disable).
		if ( isset( $params['holiday_key'] ) && null !== ( $params['holiday_enabled'] ?? null ) ) {
			$holiday_key     = sanitize_text_field( $params['holiday_key'] );
			$holiday_enabled = rest_sanitize_boolean( $params['holiday_enabled'] );
			$result          = HolidayRegistry::toggle_holiday( $group_id, $holiday_key, $holiday_enabled );

			if ( is_wp_error( $result ) ) {
				return self::error( $result );
			}

			return self::response(
				__( 'Holiday updated successfully', 'appointments-booking' ),
				array( 'groups' => HolidayRegistry::get_groups_with_holidays() )
			);
		}

		return self::error(
			new WP_Error(
				'no_update_data',
				__( 'No update data provided.', 'appointments-booking' ),
				array( 'status' => 422 )
			)
		);
	}

	/**
	 * Get individual holidays for a group with computed dates
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_group_holidays( $request ) {
		$group_id = sanitize_text_field( $request->get_param( 'id' ) );
		$groups   = HolidayRegistry::get_groups();
		$group    = null;

		foreach ( $groups as $g ) {
			if ( ( $g['id'] ?? '' ) === $group_id ) {
				$group = $g;
				break;
			}
		}

		if ( null === $group ) {
			return self::error(
				new WP_Error(
					'group_not_found',
					__( 'Holiday group not found.', 'appointments-booking' ),
					array( 'status' => 404 )
				)
			);
		}

		$holidays     = HolidayRegistry::get_group_holidays_with_status( $group );
		$current_year = (int) gmdate( 'Y' );
		$next_year    = $current_year + 1;

		// Add computed dates for current and next year.
		$holidays = array_map(
			function ( $holiday ) use ( $current_year, $next_year ) {
				$holiday['dates'] = array(
					$current_year => HolidayResolver::compute_date( $holiday, $current_year ),
					$next_year    => HolidayResolver::compute_date( $holiday, $next_year ),
				);
				return $holiday;
			},
			$holidays
		);

		return self::response(
			__( 'Group holidays fetched successfully', 'appointments-booking' ),
			array( 'holidays' => $holidays )
		);
	}
}
