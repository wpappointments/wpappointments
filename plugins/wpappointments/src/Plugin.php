<?php
/**
 * Main plugin class file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments;

use WPAppointments\Core\PluginInfo;

/**
 * Main plugin class.
 * Handle all plugin initialization, activation and deactivation.
 */
class Plugin extends Core\Singleton {
	/**
	 * Get instance of a class by key
	 *
	 * @param string $key Class key.
	 *
	 * @return object Singleton instance
	 */
	public static function get( $key ) {
		$instances = array(
			'api' => Api\Api::get_instance(),
		);

		return $instances[ $key ];
	}

	/**
	 * Fires on plugin activation
	 *
	 * @return void
	 */
	public function on_plugin_activation() {
		$default_schedule = get_option( 'wpappointments_default_scheduleId' );

		if ( ! $default_schedule ) {
			$post_id = wp_insert_post(
				array(
					'post_title'  => 'Default Schedule',
					'post_status' => 'publish',
					'post_type'   => 'wpa-schedule',
				)
			);

			update_option( 'wpappointments_default_scheduleId', $post_id );

			$days = array( 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' );

			foreach ( $days as $day ) {
				update_post_meta(
					$post_id,
					'wpappointments_schedule_' . $day,
					wp_json_encode(
						array(
							'day'     => $day,
							'enabled' => false,
							'slots'   => array(
								'list' => array(
									array(
										'start' => array(
											'hour'   => '09',
											'minute' => null,
										),
										'end'   => array(
											'hour'   => '17',
											'minute' => null,
										),
									),
								),
							),
							'allDay'  => false,
						)
					)
				);
			}
		}

		$default_service = get_option( 'wpappointments_defaultServiceId' );

		if ( ! $default_service ) {
			$post_id = wp_insert_post(
				array(
					'post_title'  => 'Appointment',
					'post_status' => 'publish',
					'post_type'   => PluginInfo::POST_TYPES['service'],
				)
			);

			update_option( 'wpappointments_defaultServiceId', $post_id );
		}

		update_option( 'wpappointments_appointments_defaultLength', 30 );
		update_option( 'wpappointments_appointments_timePickerPrecision', 30 );
		update_option( 'wpappointments_general_timezoneSiteDefault', 1 );
	}

	/**
	 * Fires on plugin deactivation
	 *
	 * @return void
	 */
	public function on_plugin_deactivation() {
		// @phpcs:ignore
		/** @disregard P1011 because this constant is defined through wp-env config */
		if ( defined( 'WPAPPOINTMENTS_PURGE' ) && WPAPPOINTMENTS_PURGE ) {
			$this->delete_schedule_post();
			delete_option( 'wpappointments_default_scheduleId' );

			$this->delete_service_post();
			delete_option( 'wpappointments_defaultServiceId' );

			delete_option( 'wpappointments_appointments_defaultLength' );
			delete_option( 'wpappointments_appointments_timePickerPrecision' );
			delete_option( 'wpappointments_general_firstName' );
			delete_option( 'wpappointments_general_lastName' );
			delete_option( 'wpappointments_general_email' );
			delete_option( 'wpappointments_general_phoneNumber' );
			delete_option( 'wpappointments_general_startOfWeek' );
			delete_option( 'wpappointments_general_clockType' );
			delete_option( 'wpappointments_general_timeFormat' );
			delete_option( 'wpappointments_general_dateFormat' );

			$query = new \WP_Query(
				array(
					'post_type'      => 'wpa-appointment',
					'posts_per_page' => -1,
				)
			);

			$ids = wp_list_pluck( $query->posts, 'ID' );

			foreach ( $ids as $id ) {
				wp_delete_post( $id, true );
			}
		}

		// @phpcs:ignore
		/** @disregard P1011 because this constant is defined through wp-env config */
		if ( defined( 'WPAPPOINTMENTS_PURGE_WIZARD' ) && WPAPPOINTMENTS_PURGE_WIZARD ) {
			delete_option( 'wpappointments_wizard_completed' );
		}
	}

	/**
	 * Delete default schedule post
	 *
	 * @return void
	 */
	private function delete_schedule_post() {
		$default_schedule = get_option( 'wpappointments_default_scheduleId' );

		if ( ! $default_schedule ) {
			return;
		}

		wp_delete_post( $default_schedule, true );
	}

	/**
	 * Delete default service post
	 *
	 * @return void
	 */
	private function delete_service_post() {
		$default_service = get_option( 'wpappointments_defaultServiceId' );

		if ( ! $default_service ) {
			return;
		}

		wp_delete_post( $default_service, true );
	}
}
