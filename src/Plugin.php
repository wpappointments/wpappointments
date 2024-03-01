<?php
/**
 * Main plugin class file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments;

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
					'post_type'   => 'wpa_schedule',
				)
			);

			update_option( 'wpappointments_default_scheduleId', $post_id );
		}

		$default_service = get_option( 'wpappointments_defaultServiceId' );

		if ( ! $default_service ) {
			$post_id = wp_insert_post(
				array(
					'post_title'  => 'Appointment',
					'post_status' => 'publish',
					'post_type'   => 'wpa_service',
				)
			);

			update_option( 'wpappointments_defaultServiceId', $post_id );
		}

		update_option( 'wpappointments_appointments_defaultLength', 30 );
		update_option( 'wpappointments_appointments_timePickerPrecision', 30 );
	}

	/**
	 * Fires on plugin deactivation
	 *
	 * @return void
	 */
	public function on_plugin_deactivation() {
		$this->delete_schedule_post();
		delete_option( 'wpappointments_default_scheduleId' );
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
}
