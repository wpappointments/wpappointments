<?php
/**
 * Out of Office controller (/ooo endpoint)
 *
 * CRUD endpoints for OOO entries. Entries are per-user — in core,
 * the admin manages their own OOO. The Employees extension hooks
 * in to add per-employee OOO management.
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
use WPAppointments\Data\Model\OutOfOffice;
use WPAppointments\Data\Query\OutOfOfficeQuery;

/**
 * OutOfOffice endpoint class
 */
class OutOfOfficeController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::API_NAMESPACE,
			'/ooo',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_all' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_SETTINGS );
					},
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_SETTINGS );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/ooo/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_one' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_SETTINGS );
					},
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_SETTINGS );
					},
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( __CLASS__, 'delete_entry' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_SETTINGS );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/ooo/dates',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_dates' ),
					'permission_callback' => '__return_true',
				),
			)
		);
	}

	/**
	 * Get all OOO entries for the current user
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_all( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found -- Required by REST callback contract.
		$user_id = get_current_user_id();
		$results = OutOfOfficeQuery::all( $user_id );

		$entries = array_map(
			function ( $post ) {
				$model = new OutOfOffice( $post );
				return $model->normalize();
			},
			$results['entries']
		);

		$results['entries'] = $entries;

		return self::response(
			__( 'OOO entries fetched successfully', 'wpappointments' ),
			self::paginated( 'entries', $results )
		);
	}

	/**
	 * Create an OOO entry
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function create( $request ) {
		$data = self::sanitize_ooo_data( $request->get_json_params() );

		// Auto-set user_id to current user.
		$data['user_id'] = get_current_user_id();

		if ( empty( $data['start_date'] ) || empty( $data['end_date'] ) ) {
			return self::error(
				new WP_Error( 'ooo_dates_required', __( 'Start date and end date are required', 'wpappointments' ), array( 'status' => 422 ) )
			);
		}

		$model = new OutOfOffice( $data );
		$saved = $model->save();

		if ( is_wp_error( $saved ) ) {
			return self::error( $saved );
		}

		return self::response(
			__( 'OOO entry created successfully', 'wpappointments' ),
			array( 'entry' => $saved->normalize() )
		);
	}

	/**
	 * Get a single OOO entry
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_one( $request ) {
		$id    = absint( $request->get_param( 'id' ) );
		$model = new OutOfOffice( $id );

		if ( is_wp_error( $model->ooo ) ) {
			return self::error( $model->ooo );
		}

		return self::response(
			__( 'OOO entry fetched successfully', 'wpappointments' ),
			array( 'entry' => $model->normalize() )
		);
	}

	/**
	 * Update an OOO entry
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function update( $request ) {
		$id   = absint( $request->get_param( 'id' ) );
		$data = self::sanitize_ooo_data( $request->get_json_params() );

		$model   = new OutOfOffice( $id );
		$updated = $model->update( $data );

		if ( is_wp_error( $updated ) ) {
			return self::error( $updated );
		}

		return self::response(
			__( 'OOO entry updated successfully', 'wpappointments' ),
			array( 'entry' => $updated->normalize() )
		);
	}

	/**
	 * Delete an OOO entry
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function delete_entry( $request ) {
		$id = absint( $request->get_param( 'id' ) );

		$model   = new OutOfOffice( $id );
		$deleted = $model->delete();

		if ( is_wp_error( $deleted ) ) {
			return self::error( $deleted );
		}

		return self::response(
			__( 'OOO entry deleted successfully', 'wpappointments' ),
			array( 'id' => $deleted )
		);
	}

	/**
	 * Get blocked dates for an entity in a date range (public)
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_dates( $request ) {
		$entity_id  = absint( $request->get_param( 'entity_id' ) );
		$start_date = sanitize_text_field( $request->get_param( 'start_date' ) ?? '' );
		$end_date   = sanitize_text_field( $request->get_param( 'end_date' ) ?? '' );

		if ( empty( $start_date ) || empty( $end_date ) ) {
			return self::error(
				new WP_Error( 'ooo_dates_required', __( 'start_date and end_date are required', 'wpappointments' ), array( 'status' => 422 ) )
			);
		}

		$owner_ids = apply_filters(
			'wpappointments_entity_owners',
			array( get_current_user_id() ),
			$entity_id
		);

		$posts   = OutOfOfficeQuery::for_date_range( $start_date, $end_date, $owner_ids );
		$blocked = array();

		foreach ( $posts as $post ) {
			$model      = new OutOfOffice( $post );
			$normalized = $model->normalize();

			$current = new \DateTime( $normalized['startDate'] );
			$end     = new \DateTime( $normalized['endDate'] );

			while ( $current <= $end ) {
				$date_str = $current->format( 'Y-m-d' );

				$entry = array( 'date' => $date_str );

				if ( $normalized['notePublic'] && ! empty( $normalized['notes'] ) ) {
					$entry['note'] = $normalized['notes'];
				}

				$blocked[] = $entry;
				$current->modify( '+1 day' );
			}
		}

		return self::response(
			__( 'Blocked dates fetched successfully', 'wpappointments' ),
			array( 'dates' => $blocked )
		);
	}

	/**
	 * Sanitize OOO data from request
	 *
	 * @param array $data Raw data.
	 *
	 * @return array Sanitized data.
	 */
	private static function sanitize_ooo_data( $data ) {
		$sanitized = array();

		if ( isset( $data['start_date'] ) ) {
			$date = sanitize_text_field( $data['start_date'] );
			$obj  = \DateTime::createFromFormat( 'Y-m-d', $date );

			if ( $obj && $obj->format( 'Y-m-d' ) === $date ) {
				$sanitized['start_date'] = $date;
			}
		}

		if ( isset( $data['end_date'] ) ) {
			$date = sanitize_text_field( $data['end_date'] );
			$obj  = \DateTime::createFromFormat( 'Y-m-d', $date );

			if ( $obj && $obj->format( 'Y-m-d' ) === $date ) {
				$sanitized['end_date'] = $date;
			}
		}

		if ( isset( $data['reason'] ) ) {
			$reason = sanitize_text_field( $data['reason'] );

			if ( in_array( $reason, OutOfOffice::ALLOWED_REASONS, true ) ) {
				$sanitized['reason'] = $reason;
			}
		}

		if ( isset( $data['notes'] ) ) {
			$sanitized['notes'] = sanitize_textarea_field( $data['notes'] );
		}

		if ( isset( $data['note_public'] ) ) {
			$sanitized['note_public'] = rest_sanitize_boolean( $data['note_public'] );
		}

		return $sanitized;
	}
}
