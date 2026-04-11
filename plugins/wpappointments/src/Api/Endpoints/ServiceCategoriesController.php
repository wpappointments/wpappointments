<?php
/**
 * Service categories controller (/service-categories endpoint)
 *
 * @package WPAppointments
 * @since 0.2.0
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Core\Capabilities;
use WPAppointments\Core\PluginInfo;

/**
 * Service categories endpoint class
 */
class ServiceCategoriesController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::API_NAMESPACE,
			'/service-categories',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_all_categories' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::VIEW_SERVICES );
					},
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create_category' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::CREATE_SERVICES );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/service-categories/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update_category' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::EDIT_SERVICES );
					},
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( __CLASS__, 'delete_category' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::DELETE_SERVICES );
					},
				),
			)
		);
	}

	/**
	 * Get all service categories
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_all_categories( WP_REST_Request $request ) {
		$taxonomy = PluginInfo::TAXONOMIES['service-category'];

		$terms = get_terms(
			array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
			)
		);

		if ( is_wp_error( $terms ) ) {
			return self::error( $terms );
		}

		$categories = array_map(
			function ( $term ) {
				return array(
					'id'    => $term->term_id,
					'name'  => $term->name,
					'slug'  => $term->slug,
					'count' => $term->count,
				);
			},
			$terms
		);

		return self::response(
			__( 'Service categories fetched successfully', 'wpappointments' ),
			array(
				'categories' => $categories,
			)
		);
	}

	/**
	 * Create service category
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function create_category( WP_REST_Request $request ) {
		$data     = $request->get_json_params();
		$name     = sanitize_text_field( $data['name'] ?? '' );
		$taxonomy = PluginInfo::TAXONOMIES['service-category'];

		if ( empty( $name ) ) {
			return self::error(
				new \WP_Error(
					'category_name_required',
					__( 'Category name is required', 'wpappointments' ),
					array( 'status' => 422 )
				)
			);
		}

		$result = wp_insert_term( $name, $taxonomy );

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		$term = get_term( $result['term_id'], $taxonomy );

		return self::response(
			__( 'Service category created successfully', 'wpappointments' ),
			array(
				'category' => array(
					'id'    => $term->term_id,
					'name'  => $term->name,
					'slug'  => $term->slug,
					'count' => $term->count,
				),
			)
		);
	}

	/**
	 * Update service category
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function update_category( WP_REST_Request $request ) {
		$id       = absint( $request->get_param( 'id' ) );
		$data     = $request->get_json_params();
		$name     = sanitize_text_field( $data['name'] ?? '' );
		$taxonomy = PluginInfo::TAXONOMIES['service-category'];

		if ( empty( $name ) ) {
			return self::error(
				new \WP_Error(
					'category_name_required',
					__( 'Category name is required', 'wpappointments' ),
					array( 'status' => 422 )
				)
			);
		}

		$result = wp_update_term( $id, $taxonomy, array( 'name' => $name ) );

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		$term = get_term( $id, $taxonomy );

		return self::response(
			__( 'Service category updated successfully', 'wpappointments' ),
			array(
				'category' => array(
					'id'    => $term->term_id,
					'name'  => $term->name,
					'slug'  => $term->slug,
					'count' => $term->count,
				),
			)
		);
	}

	/**
	 * Delete service category
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function delete_category( WP_REST_Request $request ) {
		$id       = absint( $request->get_param( 'id' ) );
		$taxonomy = PluginInfo::TAXONOMIES['service-category'];

		$result = wp_delete_term( $id, $taxonomy );

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		return self::response(
			__( 'Service category deleted successfully', 'wpappointments' ),
			array(
				'categoryId' => $id,
			)
		);
	}
}
