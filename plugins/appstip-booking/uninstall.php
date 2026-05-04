<?php
/**
 * Uninstall handler.
 *
 * Removes plugin options and stored appointment posts.
 *
 * @package Appstip\Booking
 */

declare(strict_types=1);

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'appstip_booking_default_duration' );

$appstip_booking_post_ids = get_posts(
	array(
		'post_type'      => 'appstip_appointment',
		'post_status'    => 'any',
		'posts_per_page' => -1,
		'fields'         => 'ids',
		'no_found_rows'  => true,
	)
);

if ( is_array( $appstip_booking_post_ids ) ) {
	foreach ( $appstip_booking_post_ids as $appstip_booking_post_id ) {
		wp_delete_post( (int) $appstip_booking_post_id, true );
	}
}
