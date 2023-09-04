<?php
/**
 * Admin assets class file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Admin;

use WPAppointments\Core;

/**
 * Handle registration of admin scripts, styles and everything related
 */
class Assets extends Core\WPIntegrator implements Core\Hookable {
	/**
	 * Register admin scripts and styles
	 *
	 * @action admin_enqueue_scripts
	 *
	 * @return void
	 */
	public function admin_enqueue_scripts() {
		wp_enqueue_style(
			'wpappointments-admin-css',
			WPAPPOINTMENTS_PLUGIN_DIR_URL . '/assets/styles/admin.css',
			array( 'wp-edit-blocks' ),
			WPAPPOINTMENTS_VERSION
		);

		$admin_deps = require_once WPAPPOINTMENTS_PLUGIN_DIR_PATH . '/build/admin.tsx.asset.php';

		wp_enqueue_script(
			'wpappointments-admin-js',
			WPAPPOINTMENTS_PLUGIN_DIR_URL . '/build/admin.tsx.js',
			$admin_deps['dependencies'],
			$admin_deps['version'],
			true
		);

		wp_localize_script(
			'wpappointments-admin-js',
			'wpappointments',
			array(
				'api' => array(
					'root'      => esc_url_raw( rest_url() ),
					'namespace' => WPAPPOINTMENTS_API_NAMESPACE,
					'url'       => esc_url_raw( rest_url( WPAPPOINTMENTS_API_NAMESPACE ) ),
					'nonce'     => wp_create_nonce( 'wp_rest' ),
				),
			)
		);
	}
}
