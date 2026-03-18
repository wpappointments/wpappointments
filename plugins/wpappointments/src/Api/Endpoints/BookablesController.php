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
		$data = $request->get_json_params();

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
		$id    = (int) $request->get_param( 'id' );
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
		$id   = (int) $request->get_param( 'id' );
		$data = $request->get_json_params();

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
		$id = (int) $request->get_param( 'id' );

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
}
