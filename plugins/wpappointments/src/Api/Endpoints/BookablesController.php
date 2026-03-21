<?php
/**
 * Bookables controller (/bookables endpoint)
 *
 * CRUD endpoints for bookable entities. Type-aware — delegates
 * validation and normalization to registered type handlers.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Api\Endpoints;

use WP_Error;
use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Core\Capabilities;
use WPAppointments\Data\Model\BookableEntity;
use WPAppointments\Data\Query\BookableQuery;

/**
 * Bookables endpoint class
 */
class BookablesController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::API_NAMESPACE,
			'/bookables',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_all_bookables' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create_bookable' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/bookables/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_bookable' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update_bookable' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( __CLASS__, 'delete_bookable' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
			)
		);
	}

	/**
	 * Get all bookable entities
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_all_bookables( $request ) {
		$query = array(
			'postsPerPage' => $request->get_param( 'postsPerPage' ) ?? -1,
			'paged'        => $request->get_param( 'paged' ) ?? 1,
		);

		$type = $request->get_param( 'type' );
		if ( $type ) {
			$query['type'] = $type;
		}

		$active = $request->get_param( 'active' );
		if ( null !== $active ) {
			$query['active'] = filter_var( $active, FILTER_VALIDATE_BOOLEAN );
		}

		$results = BookableQuery::all( $query );

		$bookables = array_map(
			function ( $post ) {
				$model = new BookableEntity( $post );
				return $model->normalize();
			},
			$results['bookables']
		);

		$results['bookables'] = $bookables;

		return self::response(
			__( 'Bookables fetched successfully', 'wpappointments' ),
			self::paginated( 'bookables', $results )
		);
	}

	/**
	 * Create a bookable entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function create_bookable( $request ) {
		$data = self::sanitize_bookable_data( $request->get_json_params() );

		if ( empty( $data['name'] ) ) {
			return self::error(
				new WP_Error( 'bookable_name_required', __( 'Bookable name is required', 'wpappointments' ), array( 'status' => 422 ) )
			);
		}

		$model = new BookableEntity( $data );
		$saved = $model->save();

		if ( is_wp_error( $saved ) ) {
			return self::error( $saved );
		}

		return self::response(
			__( 'Bookable created successfully', 'wpappointments' ),
			array( 'bookable' => $saved->normalize() )
		);
	}

	/**
	 * Get a single bookable entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_bookable( $request ) {
		$id    = absint( $request->get_param( 'id' ) );
		$model = new BookableEntity( $id );

		if ( is_wp_error( $model->bookable ) ) {
			return self::error( $model->bookable );
		}

		return self::response(
			__( 'Bookable fetched successfully', 'wpappointments' ),
			array( 'bookable' => $model->normalize() )
		);
	}

	/**
	 * Update a bookable entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function update_bookable( $request ) {
		$id   = absint( $request->get_param( 'id' ) );
		$data = self::sanitize_bookable_data( $request->get_json_params() );

		$model   = new BookableEntity( $id );
		$updated = $model->update( $data );

		if ( is_wp_error( $updated ) ) {
			return self::error( $updated );
		}

		return self::response(
			__( 'Bookable updated successfully', 'wpappointments' ),
			array( 'bookable' => $updated->normalize() )
		);
	}

	/**
	 * Delete a bookable entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function delete_bookable( $request ) {
		$id = absint( $request->get_param( 'id' ) );

		$model   = new BookableEntity( $id );
		$deleted = $model->delete();

		if ( is_wp_error( $deleted ) ) {
			return self::error( $deleted );
		}

		return self::response(
			__( 'Bookable deleted successfully', 'wpappointments' ),
			array( 'id' => $deleted )
		);
	}

	/**
	 * Sanitize bookable data from request JSON body
	 *
	 * @param array $data Raw request data.
	 *
	 * @return array Sanitized data.
	 */
	private static function sanitize_bookable_data( $data ) {
		$sanitized = array();

		if ( isset( $data['name'] ) ) {
			$sanitized['name'] = sanitize_text_field( $data['name'] );
		}

		if ( isset( $data['description'] ) ) {
			$sanitized['description'] = sanitize_textarea_field( $data['description'] );
		}

		if ( isset( $data['type'] ) ) {
			$sanitized['type'] = sanitize_key( $data['type'] );
		}

		if ( isset( $data['active'] ) ) {
			$sanitized['active'] = rest_sanitize_boolean( $data['active'] );
		}

		if ( isset( $data['image'] ) ) {
			$sanitized['image'] = esc_url_raw( $data['image'] );
		}

		$int_fields = array( 'schedule_id', 'buffer_before', 'buffer_after', 'min_lead_time', 'max_lead_time', 'duration' );

		foreach ( $int_fields as $field ) {
			if ( isset( $data[ $field ] ) ) {
				$sanitized[ $field ] = absint( $data[ $field ] );
			}
		}

		if ( isset( $data['attributes'] ) && is_array( $data['attributes'] ) ) {
			$sanitized['attributes'] = self::sanitize_recursive( $data['attributes'] );
		}

		return $sanitized;
	}

	/**
	 * Recursively sanitize an array of mixed values
	 *
	 * @param array $data Data to sanitize.
	 *
	 * @return array Sanitized data.
	 */
	private static function sanitize_recursive( $data ) {
		$sanitized = array();

		foreach ( $data as $key => $value ) {
			$key = sanitize_key( $key );

			if ( is_array( $value ) ) {
				$sanitized[ $key ] = self::sanitize_recursive( $value );
			} elseif ( is_bool( $value ) ) {
				$sanitized[ $key ] = (bool) $value;
			} elseif ( is_int( $value ) ) {
				$sanitized[ $key ] = (int) $value;
			} elseif ( is_float( $value ) ) {
				$sanitized[ $key ] = (float) $value;
			} else {
				$sanitized[ $key ] = sanitize_text_field( (string) $value );
			}
		}

		return $sanitized;
	}
}
