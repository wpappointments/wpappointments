<?php
/**
 * Bookable variants controller (/bookables/{id}/variants endpoint)
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WP_Error;
use WPAppointments\Api\Controller;
use WPAppointments\Core\Capabilities;
use WPAppointments\Data\Model\BookableVariant;
use WPAppointments\Data\Query\BookableVariantQuery;

/**
 * Variants endpoint class
 */
class VariantsController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::API_NAMESPACE,
			'/bookables/(?P<entity_id>\d+)/variants',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_variants' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create_variant' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/bookables/(?P<entity_id>\d+)/variants/generate',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'generate_variants' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/bookables/(?P<entity_id>\d+)/variants/(?P<variant_id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_variant' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update_variant' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( __CLASS__, 'delete_variant' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
			)
		);
	}

	/**
	 * Get all variants for a bookable entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_variants( WP_REST_Request $request ) {
		$entity_id = (int) $request->get_param( 'entity_id' );
		$query     = array();

		$active = $request->get_param( 'active' );
		if ( null !== $active ) {
			$query['active'] = filter_var( $active, FILTER_VALIDATE_BOOLEAN );
		}

		$results = BookableVariantQuery::by_entity( $entity_id, $query );

		return self::response(
			__( 'Variants fetched successfully', 'wpappointments' ),
			array(
				'variants'     => array_map(
					function ( $post ) {
						$variant = new BookableVariant( $post );
						return $variant->normalize();
					},
					$results['variants']
				),
				'totalItems'   => $results['total_items'],
				'totalPages'   => $results['total_pages'],
				'postsPerPage' => $results['posts_per_page'],
				'currentPage'  => $results['current_page'],
			)
		);
	}

	/**
	 * Get single variant
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_variant( WP_REST_Request $request ) {
		$variant_id = (int) $request->get_param( 'variant_id' );
		$variant    = new BookableVariant( $variant_id );

		if ( is_wp_error( $variant->variant ) ) {
			return self::error( $variant->variant );
		}

		return self::response(
			__( 'Variant fetched successfully', 'wpappointments' ),
			array(
				'variant' => $variant->normalize(),
			)
		);
	}

	/**
	 * Create variant
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function create_variant( WP_REST_Request $request ) {
		$entity_id = (int) $request->get_param( 'entity_id' );
		$data      = $request->get_json_params();

		$data['parent_id'] = $entity_id;

		$variant = new BookableVariant( $data );
		$result  = $variant->save();

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		return self::response(
			__( 'Variant created successfully', 'wpappointments' ),
			array(
				'variant' => $result->normalize(),
			)
		);
	}

	/**
	 * Update variant
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function update_variant( WP_REST_Request $request ) {
		$variant_id = (int) $request->get_param( 'variant_id' );
		$data       = $request->get_json_params();

		$variant = new BookableVariant( $variant_id );
		$result  = $variant->update( $data );

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		return self::response(
			__( 'Variant updated successfully', 'wpappointments' ),
			array(
				'variant' => $result->normalize(),
			)
		);
	}

	/**
	 * Delete variant
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function delete_variant( WP_REST_Request $request ) {
		$variant_id = (int) $request->get_param( 'variant_id' );

		$variant = new BookableVariant( $variant_id );
		$result  = $variant->delete();

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		return self::response(
			__( 'Variant deleted successfully', 'wpappointments' ),
			array(
				'variantId' => $result,
			)
		);
	}

	/**
	 * Generate variants from attribute matrix
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function generate_variants( WP_REST_Request $request ) {
		$entity_id = (int) $request->get_param( 'entity_id' );

		$result = BookableVariant::generate_from_matrix( $entity_id );

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		return self::response(
			__( 'Variants generated successfully', 'wpappointments' ),
			array(
				'variants' => array_map(
					function ( $variant ) {
						return $variant->normalize();
					},
					$result
				),
			)
		);
	}
}
