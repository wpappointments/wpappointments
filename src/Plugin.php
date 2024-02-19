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
		$default_schedule = get_option( 'wpappointments_default_schedule_id' );

		if ( ! $default_schedule ) {
			$post_id = wp_insert_post(
				array(
					'post_title'  => 'Default Schedule',
					'post_status' => 'publish',
					'post_type'   => 'wpa_schedule',
				)
			);

			update_option( 'wpappointments_default_schedule_id', $post_id );
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
		$default_schedule = get_option( 'wpappointments_default_schedule_id' );

		if ( ! $default_schedule ) {
			return;
		}

		wp_delete_post( $default_schedule, true );
	}
}
