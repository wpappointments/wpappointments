<?php
/**
 * Post types registration class file
 *
 * @package WPAppointments
 * @since 0.2.0
 */

namespace WPAppointments\Core;

/**
 * PostTypes class
 */
class PostTypes {
	/**
	 * Register all custom post types and taxonomies
	 *
	 * @return void
	 */
	public static function register() {
		self::register_appointment_post_type();
		self::register_schedule_post_type();
		self::register_service_post_type();
		self::register_entity_post_type();
		self::register_service_category_taxonomy();
	}

	/**
	 * Register appointment post type
	 *
	 * @return void
	 */
	private static function register_appointment_post_type() {
		register_post_type(
			PluginInfo::POST_TYPES['appointment'],
			array(
				'label'               => __( 'Appointments', 'wpappointments' ),
				'public'              => false,
				'show_ui'             => true,
				'show_in_menu'        => false,
				'show_in_rest'        => true,
				'capability_type'     => 'post',
				'map_meta_cap'        => true,
				'hierarchical'        => false,
				'rewrite'             => false,
				'query_var'           => false,
				'supports'            => array( 'title', 'custom-fields' ),
				'exclude_from_search' => true,
				'publicly_queryable'  => false,
			)
		);
	}

	/**
	 * Register schedule post type
	 *
	 * @return void
	 */
	private static function register_schedule_post_type() {
		register_post_type(
			PluginInfo::POST_TYPES['schedule'],
			array(
				'label'               => __( 'Schedules', 'wpappointments' ),
				'public'              => false,
				'show_ui'             => true,
				'show_in_menu'        => false,
				'show_in_rest'        => true,
				'capability_type'     => 'post',
				'map_meta_cap'        => true,
				'hierarchical'        => false,
				'rewrite'             => false,
				'query_var'           => false,
				'supports'            => array( 'title', 'custom-fields' ),
				'exclude_from_search' => true,
				'publicly_queryable'  => false,
			)
		);
	}

	/**
	 * Register service post type
	 *
	 * @return void
	 */
	private static function register_service_post_type() {
		register_post_type(
			PluginInfo::POST_TYPES['service'],
			array(
				'label'               => __( 'Services', 'wpappointments' ),
				'public'              => false,
				'show_ui'             => true,
				'show_in_menu'        => false,
				'show_in_rest'        => true,
				'capability_type'     => 'post',
				'map_meta_cap'        => true,
				'hierarchical'        => false,
				'rewrite'             => false,
				'query_var'           => false,
				'supports'            => array( 'title', 'custom-fields' ),
				'exclude_from_search' => true,
				'publicly_queryable'  => false,
			)
		);
	}

	/**
	 * Register service category taxonomy
	 *
	 * @return void
	 */
	private static function register_service_category_taxonomy() {
		register_taxonomy(
			PluginInfo::TAXONOMIES['service-category'],
			PluginInfo::POST_TYPES['service'],
			array(
				'label'             => __( 'Service Categories', 'wpappointments' ),
				'labels'            => array(
					'name'          => __( 'Service Categories', 'wpappointments' ),
					'singular_name' => __( 'Service Category', 'wpappointments' ),
					'add_new_item'  => __( 'Add New Service Category', 'wpappointments' ),
					'new_item_name' => __( 'New Service Category Name', 'wpappointments' ),
				),
				'public'            => false,
				'show_ui'           => false,
				'show_in_rest'      => false,
				'hierarchical'      => false,
				'rewrite'           => false,
				'query_var'         => false,
				'show_admin_column' => false,
				'capabilities'      => array(
					'manage_terms' => Capabilities::MANAGE_SERVICES,
					'edit_terms'   => Capabilities::MANAGE_SERVICES,
					'delete_terms' => Capabilities::MANAGE_SERVICES,
					'assign_terms' => Capabilities::MANAGE_SERVICES,
				),
			)
		);
	}

	/**
	 * Register entity post type
	 *
	 * Entities are bookable resources (rooms, tables, equipment, etc.)
	 * that support hierarchical nesting (e.g., restaurant → table → seat).
	 *
	 * @return void
	 */
	private static function register_entity_post_type() {
		register_post_type(
			PluginInfo::POST_TYPES['entity'],
			array(
				'label'               => __( 'Entities', 'wpappointments' ),
				'public'              => false,
				'show_ui'             => true,
				'show_in_menu'        => false,
				'show_in_rest'        => true,
				'capability_type'     => 'post',
				'map_meta_cap'        => true,
				'hierarchical'        => true,
				'rewrite'             => false,
				'query_var'           => false,
				'supports'            => array( 'title', 'custom-fields', 'page-attributes' ),
				'exclude_from_search' => true,
				'publicly_queryable'  => false,
			)
		);
	}
}
