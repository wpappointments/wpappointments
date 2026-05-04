<?php
/**
 * Admin settings page.
 *
 * @package Appstip\Booking
 */

declare(strict_types=1);

namespace Appstip\Booking\Admin;

use Appstip\Booking\PostType;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders and persists the plugin settings page.
 */
final class SettingsPage {
	public const OPTION_GROUP = 'appstip_booking_settings';
	public const OPTION_NAME  = 'appstip_booking_default_duration';
	public const PAGE_SLUG    = 'appstip-booking-settings';

	/**
	 * Hook registration.
	 */
	public function register(): void {
		add_action( 'admin_menu', array( $this, 'add_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}

	/**
	 * Add submenu page under Appointments.
	 */
	public function add_menu(): void {
		add_submenu_page(
			'edit.php?post_type=' . PostType::SLUG,
			__( 'Appstip Booking Settings', 'appstip-booking' ),
			__( 'Settings', 'appstip-booking' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render' )
		);
	}

	/**
	 * Register the option + section + field.
	 */
	public function register_settings(): void {
		register_setting(
			self::OPTION_GROUP,
			self::OPTION_NAME,
			array(
				'type'              => 'integer',
				'description'       => __( 'Default appointment duration in minutes.', 'appstip-booking' ),
				'sanitize_callback' => array( $this, 'sanitize_duration' ),
				'default'           => 30,
				'show_in_rest'      => false,
			)
		);

		add_settings_section(
			'appstip_booking_general',
			__( 'General', 'appstip-booking' ),
			'__return_false',
			self::PAGE_SLUG
		);

		add_settings_field(
			self::OPTION_NAME,
			__( 'Default duration (minutes)', 'appstip-booking' ),
			array( $this, 'render_duration_field' ),
			self::PAGE_SLUG,
			'appstip_booking_general',
			array( 'label_for' => self::OPTION_NAME )
		);
	}

	/**
	 * Clamp the submitted duration into the supported range.
	 *
	 * @param mixed $value Raw posted value.
	 */
	public function sanitize_duration( $value ): int {
		$duration = absint( $value );
		if ( $duration < 5 || $duration > 480 ) {
			return 30;
		}
		return $duration;
	}

	/**
	 * Render the integer input.
	 */
	public function render_duration_field(): void {
		$value = (int) get_option( self::OPTION_NAME, 30 );
		printf(
			'<input type="number" name="%1$s" id="%1$s" value="%2$s" min="5" max="480" step="5" class="small-text" />',
			esc_attr( self::OPTION_NAME ),
			esc_attr( (string) $value )
		);
	}

	/**
	 * Render the page wrapper + form.
	 */
	public function render(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'appstip-booking' ) );
		}

		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<form method="post" action="options.php">
		<?php
		settings_fields( self::OPTION_GROUP );
		do_settings_sections( self::PAGE_SLUG );
		submit_button();
		?>
			</form>
		</div>
		<?php
	}
}
