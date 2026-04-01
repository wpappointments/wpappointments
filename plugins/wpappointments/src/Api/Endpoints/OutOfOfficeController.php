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

		if ( is_wp_error( $data ) ) {
			return self::error( $data );
		}

		// Auto-set user_id to current user.
		$data['user_id'] = get_current_user_id();

		if ( empty( $data['start_date'] ) || empty( $data['end_date'] ) ) {
			return self::error(
				new WP_Error( 'ooo_dates_required', __( 'Start date and end date are required', 'wpappointments' ), array( 'status' => 422 ) )
			);
		}

		if ( $data['start_date'] > $data['end_date'] ) {
			return self::error(
				new WP_Error( 'ooo_dates_inverted', __( 'Start date must be before end date', 'wpappointments' ), array( 'status' => 422 ) )
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

		$owner_check = self::verify_entry_owner( $id );

		if ( is_wp_error( $owner_check ) ) {
			return self::error( $owner_check );
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

		if ( is_wp_error( $data ) ) {
			return self::error( $data );
		}

		$owner_check = self::verify_entry_owner( $id );

		if ( is_wp_error( $owner_check ) ) {
			return self::error( $owner_check );
		}

		// Validate date range if both dates provided.
		$start = $data['start_date'] ?? get_post_meta( $id, 'start_date', true );
		$end   = $data['end_date'] ?? get_post_meta( $id, 'end_date', true );

		if ( $start && $end && $start > $end ) {
			return self::error(
				new WP_Error( 'ooo_dates_inverted', __( 'Start date must be before end date', 'wpappointments' ), array( 'status' => 422 ) )
			);
		}

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

		$owner_check = self::verify_entry_owner( $id );

		if ( is_wp_error( $owner_check ) ) {
			return self::error( $owner_check );
		}

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

		$start_obj = \DateTime::createFromFormat( 'Y-m-d', $start_date );
		$end_obj   = \DateTime::createFromFormat( 'Y-m-d', $end_date );

		if ( ! $start_obj || $start_obj->format( 'Y-m-d' ) !== $start_date
			|| ! $end_obj || $end_obj->format( 'Y-m-d' ) !== $end_date
		) {
			return self::error(
				new WP_Error( 'ooo_dates_invalid', __( 'start_date and end_date must be valid Y-m-d dates', 'wpappointments' ), array( 'status' => 422 ) )
			);
		}

		if ( $start_date > $end_date ) {
			return self::error(
				new WP_Error( 'ooo_dates_order', __( 'start_date must not be after end_date', 'wpappointments' ), array( 'status' => 422 ) )
			);
		}

		if ( ! $entity_id ) {
			$entity_id = absint( get_option( 'wpappointments_core_entityId', 0 ) );
		}

		$entity_post   = $entity_id ? get_post( $entity_id ) : null;
		$default_owner = $entity_post ? absint( $entity_post->post_author ) : 0;
		$owner_ids     = apply_filters(
			'wpappointments_entity_owners',
			$default_owner ? array( $default_owner ) : array(),
			$entity_id
		);

		$posts           = OutOfOfficeQuery::for_date_range( $start_date, $end_date, $owner_ids );
		$blocked         = array();
		$requested_start = new \DateTime( $start_date );
		$requested_end   = new \DateTime( $end_date );

		foreach ( $posts as $post ) {
			$model      = new OutOfOffice( $post );
			$normalized = $model->normalize();

			$current = max( new \DateTime( $normalized['startDate'] ), $requested_start );
			$end     = min( new \DateTime( $normalized['endDate'] ), $requested_end );

			while ( $current <= $end ) {
				$date_str = $current->format( 'Y-m-d' );

				$entry = array( 'date' => $date_str );

				if ( $normalized['notePublic'] && ! empty( $normalized['notes'] ) ) {
					$entry['reason'] = $normalized['reason'];
					$entry['note']   = $normalized['notes'];
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
	 * Verify the current user owns the OOO entry
	 *
	 * @param int $entry_id OOO entry post ID.
	 *
	 * @return true|\WP_Error True on success, WP_Error if not the owner.
	 */
	private static function verify_entry_owner( $entry_id ) {
		$owner_id = absint( get_post_meta( $entry_id, 'user_id', true ) );

		if ( get_current_user_id() !== $owner_id ) {
			return new WP_Error(
				'ooo_forbidden',
				__( 'You do not own this time off entry.', 'wpappointments' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}

	/**
	 * Sanitize OOO data from request
	 *
	 * @param array $data Raw data.
	 *
	 * @return array|\WP_Error Sanitized data or WP_Error on invalid input.
	 */
	private static function sanitize_ooo_data( $data ) {
		$sanitized = array();

		if ( isset( $data['start_date'] ) ) {
			$date = sanitize_text_field( $data['start_date'] );
			$obj  = \DateTime::createFromFormat( 'Y-m-d', $date );

			if ( ! $obj || $obj->format( 'Y-m-d' ) !== $date ) {
				return new WP_Error( 'ooo_invalid_start_date', __( 'start_date must be a valid Y-m-d date', 'wpappointments' ), array( 'status' => 422 ) );
			}

			$sanitized['start_date'] = $date;
		}

		if ( isset( $data['end_date'] ) ) {
			$date = sanitize_text_field( $data['end_date'] );
			$obj  = \DateTime::createFromFormat( 'Y-m-d', $date );

			if ( ! $obj || $obj->format( 'Y-m-d' ) !== $date ) {
				return new WP_Error( 'ooo_invalid_end_date', __( 'end_date must be a valid Y-m-d date', 'wpappointments' ), array( 'status' => 422 ) );
			}

			$sanitized['end_date'] = $date;
		}

		if ( isset( $data['reason'] ) ) {
			$reason = sanitize_text_field( $data['reason'] );

			if ( ! in_array( $reason, OutOfOffice::ALLOWED_REASONS, true ) ) {
				return new WP_Error( 'ooo_invalid_reason', __( 'reason must be one of the allowed values', 'wpappointments' ), array( 'status' => 422 ) );
			}

			$sanitized['reason'] = $reason;
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
