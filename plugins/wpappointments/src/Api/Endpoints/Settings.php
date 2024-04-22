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
			static::API_NAMESPACE,
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
			static::API_NAMESPACE,
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
		$settings = new SettingsModel();
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
		$params   = $request->get_url_params();
		$category = $params['category'];

		$settings = new SettingsModel();
		$settings = $settings->get_all_by_category( $category );

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

		$schedule = array();

		if ( 'schedule' !== $category ) {
			$settings_model = new SettingsModel();
			$result         = $settings_model->update( $category, $settings );

			if ( is_wp_error( $result ) ) {
				return self::error( $result->get_error_message() );
			}
		} else {
			$schedule_post_id = get_option( 'wpappointments_default_scheduleId' );

			if ( $schedule_post_id ) {
				foreach ( array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ) as $day ) {
					if ( $settings->$day->allDay ) {
						$settings->$day->slots->list[0] = array(
							'start' => array(
								'hour'   => '00',
								'minute' => '00',
							),
							'end'   => array(
								'hour'   => '24',
								'minute' => '00',
							),
						);
					}

					$test = wp_json_encode( $settings->$day );
					update_post_meta( $schedule_post_id, 'wpappointments_schedule_' . $day, $test );
					array_push( $schedule, $test );
				}
			}
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
