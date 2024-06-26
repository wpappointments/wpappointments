<?php
/**
 * Settings controller (/settings endpoint)
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Data\Model\Settings;

/**
 * Settings endpoint class
 */
class SettingsController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::API_NAMESPACE,
			'/settings',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_all_settings' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/settings/(?P<category>[\w-]+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_category_settings' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/settings/(?P<category>[\w-]+)',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update_settings' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}

	/**
	 * Get all settings
	 *
	 * @return WP_REST_Response
	 */
	public static function get_all_settings() {
		$settings = new Settings();
		$settings = $settings->get_all();

		return self::response(
			__( 'Settings fetched successfully', 'wpappointments' ),
			array(
				'settings' => $settings,
			),
		);
	}

	/**
	 * Get category settings
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_category_settings( WP_REST_Request $request ) {
		$params   = $request->get_url_params();
		$category = $params['category'];

		$settings = new Settings();
		$settings = $settings->get_all_by_category( $category );

		return self::response(
			__( 'Settings in category fetched successfully', 'wpappointments' ),
			array(
				'settings' => $settings,
			),
		);
	}

	/**
	 * Create appointment post
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function update_settings( WP_REST_Request $request ) {
		$params   = $request->get_url_params();
		$category = $params['category'];
		$settings = $request->get_json_params();

		$settings_model = new Settings();
		$result         = $settings_model->update( $category, $settings );

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		return self::response(
			__( 'Settings updated successfully', 'wpappointments' ),
			array(
				'settings' => $settings,
			),
		);
	}
}
