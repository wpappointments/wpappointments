<?php
/**
 * Bookable entities controller (/bookables endpoint)
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Core\Capabilities;
use WPAppointments\Data\Model\BookableEntity;
use WPAppointments\Data\Model\BookableVariant;
use WPAppointments\Data\Query\BookableQuery;

/**
 * Bookable entities endpoint class
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
	public static function get_all_bookables( WP_REST_Request $request ) {
		$query = array();

		$type = $request->get_param( 'type' );
		if ( $type ) {
			$query['type'] = sanitize_text_field( $type );
		}

		$active = $request->get_param( 'active' );
		if ( null !== $active ) {
			$query['active'] = filter_var( $active, FILTER_VALIDATE_BOOLEAN );
		}

		$paged = $request->get_param( 'paged' );
		if ( $paged ) {
			$query['paged'] = (int) $paged;
		}

		$per_page = $request->get_param( 'per_page' );
		if ( $per_page ) {
			$query['postsPerPage'] = (int) $per_page;
		}

		$results = BookableQuery::all( $query );

		return self::response(
			__( 'Bookable entities fetched successfully', 'wpappointments' ),
			array(
				'bookables'    => array_map(
					function ( $post ) {
						$bookable = new BookableEntity( $post );
						return $bookable->normalize();
					},
					$results['bookables']
				),
				'totalItems'   => $results['total_items'],
				'totalPages'   => $results['total_pages'],
				'postsPerPage' => $results['posts_per_page'],
				'currentPage'  => $results['current_page'],
			)
		);
	}

	/**
	 * Get single bookable entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_bookable( WP_REST_Request $request ) {
		$id       = (int) $request->get_param( 'id' );
		$bookable = new BookableEntity( $id );

		if ( is_wp_error( $bookable->bookable ) ) {
			return self::error( $bookable->bookable );
		}

		return self::response(
			__( 'Bookable entity fetched successfully', 'wpappointments' ),
			array(
				'bookable' => $bookable->normalize(),
			)
		);
	}

	/**
	 * Create bookable entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function create_bookable( WP_REST_Request $request ) {
		$data     = $request->get_json_params();
		$bookable = new BookableEntity( $data );
		$result   = $bookable->save();

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		// Ensure at least one default variant exists.
		BookableVariant::ensure_default_variant( $result->bookable->ID );

		return self::response(
			__( 'Bookable entity created successfully', 'wpappointments' ),
			array(
				'bookable' => $result->normalize(),
			)
		);
	}

	/**
	 * Update bookable entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function update_bookable( WP_REST_Request $request ) {
		$id   = (int) $request->get_param( 'id' );
		$data = $request->get_json_params();

		$bookable = new BookableEntity( $id );
		$result   = $bookable->update( $data );

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		// Sync default variant if simple bookable.
		$sync_fields = array_intersect_key( $data, array_flip( BookableVariant::OVERRIDABLE_CORE_FIELDS ) );
		if ( ! empty( $sync_fields ) ) {
			BookableVariant::sync_default_variant( $id, $sync_fields );
		}

		return self::response(
			__( 'Bookable entity updated successfully', 'wpappointments' ),
			array(
				'bookable' => $result->normalize(),
			)
		);
	}

	/**
	 * Delete bookable entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function delete_bookable( WP_REST_Request $request ) {
		$id = (int) $request->get_param( 'id' );

		$bookable = new BookableEntity( $id );
		$result   = $bookable->delete();

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		return self::response(
			__( 'Bookable entity deleted successfully', 'wpappointments' ),
			array(
				'bookableId' => $result,
			)
		);
	}
}
