<?php
/**
 * Entities controller (/entities endpoint)
 *
 * @package WPAppointments
 * @since 0.3.0
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Data\Model\Entity;
use WPAppointments\Data\Query\EntitiesQuery;
use WPAppointments\Core\Capabilities;

/**
 * Entities endpoint class
 */
class EntitiesController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::API_NAMESPACE,
			'/entities',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_all_entities' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_ENTITIES );
					},
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create_entity' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_ENTITIES );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/entities/tree',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_entities_tree' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_ENTITIES );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/entities/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_entity' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_ENTITIES );
					},
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update_entity' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_ENTITIES );
					},
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( __CLASS__, 'delete_entity' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_ENTITIES );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/entities/(?P<id>\d+)/children',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_entity_children' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_ENTITIES );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/entities/(?P<id>\d+)/services',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_entity_services' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_ENTITIES );
					},
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update_entity_services' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_ENTITIES );
					},
				),
			)
		);
	}

	/**
	 * Get all entities
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_all_entities( WP_REST_Request $request ) {
		$query = array();

		$active = $request->get_param( 'active' );
		if ( null !== $active ) {
			$query['active'] = filter_var( $active, FILTER_VALIDATE_BOOLEAN );
		}

		$parent_id = $request->get_param( 'parent_id' );
		if ( null !== $parent_id ) {
			$query['parent_id'] = (int) $parent_id;
		}

		$type = $request->get_param( 'type' );
		if ( null !== $type ) {
			$query['type'] = $type;
		}

		$paged = $request->get_param( 'paged' );
		if ( null !== $paged ) {
			$query['paged'] = (int) $paged;
		}

		$per_page = $request->get_param( 'number' );
		if ( null !== $per_page ) {
			$query['postsPerPage'] = (int) $per_page;
		}

		$results = EntitiesQuery::all( $query );

		return self::response(
			__( 'Entities fetched successfully', 'wpappointments' ),
			array(
				'entities' => array_map(
					function ( $entity_post ) {
						$entity = new Entity( $entity_post );
						return $entity->normalize();
					},
					$results['entities']
				),
				'total'    => $results['total_items'],
			)
		);
	}

	/**
	 * Get entities as a nested tree
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_entities_tree( WP_REST_Request $request ) {
		$parent_id = $request->get_param( 'parent_id' );
		$root      = null !== $parent_id ? (int) $parent_id : 0;

		$tree = EntitiesQuery::tree( $root );

		return self::response(
			__( 'Entity tree fetched successfully', 'wpappointments' ),
			array(
				'tree' => $tree,
			)
		);
	}

	/**
	 * Get single entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_entity( WP_REST_Request $request ) {
		$id     = (int) $request->get_param( 'id' );
		$entity = new Entity( $id );

		if ( is_wp_error( $entity->entity ) ) {
			return self::error( $entity->entity );
		}

		$normalized = $entity->normalize();

		$ancestors_posts = EntitiesQuery::ancestors( $id );
		$ancestors       = array_map(
			function ( $post ) {
				$entity = new Entity( $post );
				return $entity->normalize();
			},
			$ancestors_posts
		);

		$normalized['ancestors'] = $ancestors;

		return self::response(
			__( 'Entity fetched successfully', 'wpappointments' ),
			array(
				'entity' => $normalized,
			)
		);
	}

	/**
	 * Create entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function create_entity( WP_REST_Request $request ) {
		$data   = $request->get_json_params();
		$entity = new Entity( $data );
		$result = $entity->save();

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		return self::response(
			__( 'Entity created successfully', 'wpappointments' ),
			array(
				'entity' => $result->normalize(),
			)
		);
	}

	/**
	 * Update entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function update_entity( WP_REST_Request $request ) {
		$id   = $request->get_param( 'id' );
		$data = $request->get_json_params();

		$entity = new Entity( (int) $id );
		$result = $entity->update( $data );

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		return self::response(
			__( 'Entity updated successfully', 'wpappointments' ),
			array(
				'entity' => $result->normalize(),
			)
		);
	}

	/**
	 * Delete entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function delete_entity( WP_REST_Request $request ) {
		$id                = $request->get_param( 'id' );
		$reassign_children = $request->get_param( 'reassign_children' );

		$entity = new Entity( (int) $id );
		$result = $entity->delete( false !== $reassign_children );

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		return self::response(
			__( 'Entity deleted successfully', 'wpappointments' ),
			array(
				'entityId' => $id,
			)
		);
	}

	/**
	 * Get children of a specific entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_entity_children( WP_REST_Request $request ) {
		$id      = (int) $request->get_param( 'id' );
		$results = EntitiesQuery::children( $id );

		return self::response(
			__( 'Entity children fetched successfully', 'wpappointments' ),
			array(
				'entities' => array_map(
					function ( $entity_post ) {
						$entity = new Entity( $entity_post );
						return $entity->normalize();
					},
					$results['entities']
				),
				'total'    => $results['total_items'],
			)
		);
	}

	/**
	 * Get services linked to an entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_entity_services( WP_REST_Request $request ) {
		$id          = (int) $request->get_param( 'id' );
		$service_ids = get_post_meta( $id, 'service_ids', true );

		if ( ! is_array( $service_ids ) ) {
			$service_ids = array();
		}

		$services = array();

		foreach ( $service_ids as $service_id ) {
			$service = new \WPAppointments\Data\Model\Service( (int) $service_id );

			if ( ! is_wp_error( $service->service ) && $service->service ) {
				$services[] = $service->normalize();
			}
		}

		return self::response(
			__( 'Entity services fetched successfully', 'wpappointments' ),
			array(
				'services' => $services,
			)
		);
	}

	/**
	 * Update services linked to an entity (many-to-many)
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function update_entity_services( WP_REST_Request $request ) {
		$id   = (int) $request->get_param( 'id' );
		$data = $request->get_json_params();

		$service_ids = isset( $data['service_ids'] ) ? array_map( 'intval', $data['service_ids'] ) : array();

		update_post_meta( $id, 'service_ids', $service_ids );

		foreach ( $service_ids as $service_id ) {
			$entity_ids = get_post_meta( $service_id, 'entity_ids', true );

			if ( ! is_array( $entity_ids ) ) {
				$entity_ids = array();
			}

			if ( ! in_array( $id, $entity_ids, true ) ) {
				$entity_ids[] = $id;
				update_post_meta( $service_id, 'entity_ids', $entity_ids );
			}
		}

		return self::response(
			__( 'Entity services updated successfully', 'wpappointments' ),
			array(
				'serviceIds' => $service_ids,
			)
		);
	}
}
