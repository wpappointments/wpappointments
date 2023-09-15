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
use WPAppointments\Model\Settings as SettingsModel;

/**
 * Settings endpoint
 */
class Settings extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::ROUTE_NAMESPACE,
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
			static::ROUTE_NAMESPACE,
			'/settings/(?P<category>\w+)',
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
			static::ROUTE_NAMESPACE,
			'/settings/(?P<category>\w+)',
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

		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/settings/(?P<category>\w+)/(?P<key>\w+)',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update_setting' ),
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
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_all_settings( WP_REST_Request $request ) {
		$settings = SettingsModel::get_instance();
		$settings = $settings->get_all();

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'settings' => $settings,
				),
			)
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
		return false; // TODO: Implement.
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
		$settings = json_decode( $request->get_body() );

		if ( 'schedule' !== $category ) {
			$settings_model = SettingsModel::get_instance();
			$settings_model->update( $category, $settings );
			// TODO: Update settings.
		} else {
			$default_schedule_post_id = get_option( 'wpappointments_schedule_defaultPostId' );
			// TODO: Update default schedule.
		}

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'message' => __( 'Settings updated successfully', 'wpappointments' ),
				),
			)
		);
	}
}