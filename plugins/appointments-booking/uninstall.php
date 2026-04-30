<?php
/**
 * Plugin uninstall handler
 *
 * Runs only when the user deletes the plugin through the WordPress admin
 * (WP_UNINSTALL_PLUGIN is defined). Data deletion is opt-in via the
 * `wpappointments_uninstall_cleanup` option — on purpose: operators who
 * deactivate to troubleshoot rarely want their appointments gone.
 *
 * When the option is set to a truthy value, this file removes:
 *  - All plugin options (any `wpappointments_*` key).
 *  - All plugin custom-post-type entries and their meta.
 *  - All plugin taxonomy terms.
 *  - All plugin capabilities from every role.
 *
 * @package WPAppointments
 */

// Abort if not called through the core uninstall flow.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Opt-in check — default is preserve data.
if ( ! get_option( 'wpappointments_uninstall_cleanup' ) ) {
	return;
}

global $wpdb;

// --- Custom post types ---
$wpappointments_post_types = array(
	'wpa-appointment',
	'wpa-schedule',
	'wpa-bookable',
	'wpa-bookable-variant',
	'wpa-ooo',
);

foreach ( $wpappointments_post_types as $wpappointments_post_type ) {
	$wpappointments_ids = get_posts(
		array(
			'post_type'      => $wpappointments_post_type,
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'fields'         => 'ids',
		)
	);

	foreach ( $wpappointments_ids as $wpappointments_id ) {
		wp_delete_post( (int) $wpappointments_id, true );
	}
}

// --- Taxonomies ---
$wpappointments_taxonomies = array( 'wpa-service-category' );

foreach ( $wpappointments_taxonomies as $wpappointments_taxonomy ) {
	// get_terms needs the taxonomy to be registered in some contexts; fall back
	// to a direct query to stay robust when called outside the normal runtime.
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- One-shot uninstall path; no runtime caching applicable.
	$wpappointments_term_ids = $wpdb->get_col(
		$wpdb->prepare(
			"SELECT t.term_id FROM {$wpdb->terms} AS t
			 INNER JOIN {$wpdb->term_taxonomy} AS tt ON t.term_id = tt.term_id
			 WHERE tt.taxonomy = %s",
			$wpappointments_taxonomy
		)
	);

	foreach ( $wpappointments_term_ids as $wpappointments_term_id ) {
		wp_delete_term( (int) $wpappointments_term_id, $wpappointments_taxonomy );
	}
}

// --- Options ---
// LIKE wpappointments_% covers all plugin option keys (option prefix).
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- One-shot uninstall cleanup.
$wpdb->query(
	$wpdb->prepare(
		"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
		$wpdb->esc_like( 'wpappointments_' ) . '%'
	)
);

// --- Transients (site + object cache) ---
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- One-shot uninstall cleanup.
$wpdb->query(
	$wpdb->prepare(
		"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
		'_transient_' . $wpdb->esc_like( 'wpappointments_' ) . '%',
		'_transient_timeout_' . $wpdb->esc_like( 'wpappointments_' ) . '%'
	)
);

// --- Capabilities ---
$wpappointments_caps = array(
	'wpa_manage_appointments',
	'wpa_manage_settings',
	'wpa_manage_services',
	'wpa_manage_customers',
	'wpa_manage_entities',
	'wpa_manage_bookables',
);

$wpappointments_roles = wp_roles();

if ( $wpappointments_roles && ! empty( $wpappointments_roles->role_objects ) ) {
	foreach ( $wpappointments_roles->role_objects as $wpappointments_role ) {
		foreach ( $wpappointments_caps as $wpappointments_cap ) {
			$wpappointments_role->remove_cap( $wpappointments_cap );
		}
	}
}

// Flush rewrite rules so the removed CPTs stop being registered.
flush_rewrite_rules();
