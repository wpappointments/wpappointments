<?php
/**
 * Entities query class file
 *
 * @package WPAppointments
 * @since 0.3.0
 */

namespace WPAppointments\Data\Query;

use WP_Query;
use WPAppointments\Core\PluginInfo;

/**
 * EntitiesQuery class
 */
class EntitiesQuery {
	/**
	 * Get all entities
	 *
	 * @param array $query Query parameters.
	 *
	 * @return array
	 */
	public static function all( $query = array() ) {
		$args = array(
			'post_type'      => PluginInfo::POST_TYPES['entity'],
			'posts_per_page' => $query['postsPerPage'] ?? -1,
			'post_status'    => 'publish',
			'orderby'        => $query['orderby'] ?? 'menu_order',
			'order'          => $query['order'] ?? 'ASC',
		);

		if ( isset( $query['paged'] ) ) {
			$args['paged'] = (int) $query['paged'];
		}

		if ( isset( $query['active'] ) ) {
			$args['meta_query'] = array(
				array(
					'key'     => 'active',
					'value'   => $query['active'] ? '1' : '0',
					'compare' => '=',
				),
			);
		}

		if ( isset( $query['parent_id'] ) ) {
			$args['post_parent'] = (int) $query['parent_id'];
		}

		if ( isset( $query['type'] ) && '' !== $query['type'] ) {
			if ( ! isset( $args['meta_query'] ) ) {
				$args['meta_query'] = array();
			}

			$args['meta_query'][] = array(
				'key'     => 'type',
				'value'   => sanitize_text_field( $query['type'] ),
				'compare' => '=',
			);
		}

		$entities = new WP_Query( $args );

		$total_items  = $entities->found_posts;
		$per_page     = $args['posts_per_page'] > 0 ? $args['posts_per_page'] : $total_items;
		$total_pages  = $per_page > 0 ? (int) ceil( $total_items / $per_page ) : 1;
		$current_page = $args['paged'] ?? 1;

		return array(
			'entities'       => $entities->posts,
			'total_items'    => $total_items,
			'total_pages'    => $total_pages,
			'posts_per_page' => $per_page,
			'current_page'   => $current_page,
		);
	}

	/**
	 * Get only active entities
	 *
	 * @param array $query Query parameters.
	 *
	 * @return array
	 */
	public static function active( $query = array() ) {
		$query['active'] = true;
		return self::all( $query );
	}

	/**
	 * Get root-level entities (no parent)
	 *
	 * @param array $query Query parameters.
	 *
	 * @return array
	 */
	public static function roots( $query = array() ) {
		$query['parent_id'] = 0;
		return self::all( $query );
	}

	/**
	 * Get children of a specific entity
	 *
	 * @param int   $parent_id Parent entity ID.
	 * @param array $query     Query parameters.
	 *
	 * @return array
	 */
	public static function children( $parent_id, $query = array() ) {
		$query['parent_id'] = $parent_id;
		return self::all( $query );
	}

	/**
	 * Get full tree structure starting from a given parent
	 *
	 * Returns a nested array of entities with a 'children' key.
	 *
	 * @param int   $parent_id Root parent ID (0 for all roots).
	 * @param array $query     Query parameters.
	 *
	 * @return array
	 */
	public static function tree( $parent_id = 0, $query = array() ) {
		$query['parent_id'] = $parent_id;
		$result             = self::all( $query );
		$entities           = $result['entities'];
		$tree               = array();

		foreach ( $entities as $entity_post ) {
			$entity_model = new \WPAppointments\Data\Model\Entity( $entity_post );
			$normalized   = $entity_model->normalize();

			$child_result           = self::tree( $entity_post->ID, $query );
			$normalized['children'] = $child_result;

			$tree[] = $normalized;
		}

		return $tree;
	}

	/**
	 * Get all ancestors of an entity (from immediate parent to root)
	 *
	 * @param int $entity_id Entity ID.
	 *
	 * @return array Array of entity post objects from parent to root.
	 */
	public static function ancestors( $entity_id ) {
		$ancestors = array();
		$post      = get_post( $entity_id );

		if ( ! $post ) {
			return $ancestors;
		}

		while ( $post->post_parent > 0 ) {
			$post = get_post( $post->post_parent );

			if ( ! $post ) {
				break;
			}

			$ancestors[] = $post;
		}

		return $ancestors;
	}
}
