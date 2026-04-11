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
		self::register_bookable_post_type();
		self::register_bookable_variant_post_type();
		self::register_ooo_post_type();
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
	 * Register bookable entity post type
	 *
	 * Bookable entities are the abstract base for all bookable resources.
	 * Concrete types (services, tables, rooms) are registered by plugins
	 * via the bookable type registration API.
	 *
	 * @return void
	 */
	private static function register_bookable_post_type() {
		register_post_type(
			PluginInfo::POST_TYPES['bookable'],
			array(
				'label'               => __( 'Bookables', 'wpappointments' ),
				'public'              => false,
				'show_ui'             => true,
				'show_in_menu'        => false,
				'show_in_rest'        => true,
				'capability_type'     => 'post',
				'map_meta_cap'        => false,
				'capabilities'        => array(
					'edit_post'          => 'wpa_edit_bookables',
					'read_post'          => 'wpa_view_bookables',
					'delete_post'        => 'wpa_delete_bookables',
					'edit_posts'         => 'wpa_edit_bookables',
					'edit_others_posts'  => 'wpa_edit_bookables',
					'publish_posts'      => 'wpa_create_bookables',
					'read_private_posts' => 'wpa_view_bookables',
				),
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
	 * Register bookable variant post type
	 *
	 * Variants are the actual bookable units. Every bookable entity has at
	 * least one variant. Variants link to their parent entity via post_parent.
	 *
	 * @return void
	 */
	private static function register_bookable_variant_post_type() {
		register_post_type(
			PluginInfo::POST_TYPES['bookable-variant'],
			array(
				'label'               => __( 'Bookable Variants', 'wpappointments' ),
				'public'              => false,
				'show_ui'             => true,
				'show_in_menu'        => false,
				'show_in_rest'        => true,
				'capability_type'     => 'post',
				'map_meta_cap'        => false,
				'capabilities'        => array(
					'edit_post'          => 'wpa_edit_bookables',
					'read_post'          => 'wpa_view_bookables',
					'delete_post'        => 'wpa_delete_bookables',
					'edit_posts'         => 'wpa_edit_bookables',
					'edit_others_posts'  => 'wpa_edit_bookables',
					'publish_posts'      => 'wpa_create_bookables',
					'read_private_posts' => 'wpa_view_bookables',
				),
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
	 * Register out of office post type
	 *
	 * @return void
	 */
	private static function register_ooo_post_type() {
		register_post_type(
			PluginInfo::POST_TYPES['ooo'],
			array(
				'label'               => __( 'Out of Office', 'wpappointments' ),
				'public'              => false,
				'show_ui'             => false,
				'show_in_menu'        => false,
				'show_in_rest'        => false,
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
}
