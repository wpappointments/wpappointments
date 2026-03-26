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
	 * Main plugin class.
	 * Handle all plugin initialization, activation and deactivation.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'load_textdomain' ) );
		add_action( 'init', array( 'WPAppointments\Core\PostTypes', 'register' ) );
		add_action( 'init', array( 'WPAppointments\Availability\DefaultLayers', 'register' ) );
		Notifications\Notifications::get_instance();
	}

	/**
	 * Load plugin text domain for translations
	 *
	 * @return void
	 */
	public function load_textdomain() {
		load_plugin_textdomain(
			'wpappointments',
			false,
			dirname( plugin_basename( Core\PluginInfo::PLUGIN_FILE ) ) . '/languages'
		);
	}
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
			$default_schedule = $post_id;

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

		// Create core intrinsic bookable entity.
		$core_entity_id = get_option( 'wpappointments_core_entityId' );

		if ( ! $core_entity_id ) {
			$entity_post_id = wp_insert_post(
				array(
					'post_title'  => __( 'Appointment', 'wpappointments' ),
					'post_status' => 'publish',
					'post_type'   => Core\PluginInfo::POST_TYPES['bookable'],
					'meta_input'  => array(
						'_core_entity'  => true,
						'active'        => true,
						'type'          => 'service',
						'schedule_id'   => $default_schedule ? $default_schedule : 0,
						'duration'      => 30,
						'buffer_before' => 0,
						'buffer_after'  => 0,
						'min_lead_time' => 0,
						'max_lead_time' => 0,
						'attributes'    => array(),
					),
				),
				true
			);

			if ( ! is_wp_error( $entity_post_id ) ) {
				update_option( 'wpappointments_core_entityId', $entity_post_id );

				// Create default variant for the core entity.
				wp_insert_post(
					array(
						'post_title'  => __( 'Default', 'wpappointments' ),
						'post_status' => 'publish',
						'post_type'   => Core\PluginInfo::POST_TYPES['bookable-variant'],
						'post_parent' => $entity_post_id,
						'meta_input'  => array(
							'attribute_values' => array(),
						),
					)
				);
			}
		}

		update_option( 'wpappointments_appointments_defaultLength', 30 );
		update_option( 'wpappointments_appointments_timePickerPrecision', 30 );
		update_option( 'wpappointments_general_timezoneSiteDefault', 1 );

		$this->register_capabilities();
	}

	/**
	 * Register custom capabilities
	 *
	 * @return void
	 */
	private function register_capabilities() {
		$role = get_role( 'administrator' );

		if ( ! $role ) {
			return;
		}

		foreach ( Core\Capabilities::all() as $cap ) {
			$role->add_cap( $cap );
		}
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

			$settings_model = new Data\Model\Settings();

			foreach ( $settings_model->settings as $category => $options ) {
				foreach ( $options as $option ) {
					delete_option( 'wpappointments_' . $category . '_' . $option['name'] );
				}
			}

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
}
