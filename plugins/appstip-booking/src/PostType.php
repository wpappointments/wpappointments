<?php
/**
 * Appointments custom post type.
 *
 * @package Appstip\Booking
 */

declare(strict_types=1);

namespace Appstip\Booking;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the appointments CPT.
 */
final class PostType {
	public const SLUG = 'appstip_appointment';

	/**
	 * Hook registration on init.
	 */
	public function register(): void {
		add_action( 'init', array( $this, 'register_post_type' ) );
	}

	/**
	 * Register the CPT with the WordPress Posts API.
	 */
	public function register_post_type(): void {
		register_post_type(
			self::SLUG,
			array(
				'labels'              => array(
					'name'               => __( 'Appointments', 'appstip-booking' ),
					'singular_name'      => __( 'Appointment', 'appstip-booking' ),
					'add_new'            => __( 'Add Appointment', 'appstip-booking' ),
					'add_new_item'       => __( 'Add New Appointment', 'appstip-booking' ),
					'edit_item'          => __( 'Edit Appointment', 'appstip-booking' ),
					'new_item'           => __( 'New Appointment', 'appstip-booking' ),
					'view_item'          => __( 'View Appointment', 'appstip-booking' ),
					'search_items'       => __( 'Search Appointments', 'appstip-booking' ),
					'not_found'          => __( 'No appointments found.', 'appstip-booking' ),
					'not_found_in_trash' => __( 'No appointments in Trash.', 'appstip-booking' ),
					'menu_name'          => __( 'Appstip Booking', 'appstip-booking' ),
				),
				'description'         => __( 'Appointment records managed by Appstip Booking.', 'appstip-booking' ),
				'public'              => false,
				'publicly_queryable'  => false,
				'exclude_from_search' => true,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_nav_menus'   => false,
				'show_in_admin_bar'   => false,
				'show_in_rest'        => false,
				'menu_icon'           => 'dashicons-calendar-alt',
				'supports'            => array( 'title', 'editor' ),
				'capability_type'     => 'post',
				'has_archive'         => false,
				'rewrite'             => false,
				'hierarchical'        => false,
			)
		);
	}
}
