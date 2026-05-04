<?php
/**
 * Plugin bootstrap.
 *
 * @package Appstip\Booking
 */

declare(strict_types=1);

namespace Appstip\Booking;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Bootstrap singleton.
 */
final class Plugin {
	/**
	 * Singleton instance.
	 *
	 * @var Plugin|null
	 */
	private static ?Plugin $instance = null;

	/**
	 * Get the singleton.
	 */
	public static function instance(): Plugin {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Wire hooks and register subsystems.
	 *
	 * Translations load automatically via WordPress.org since WP 4.6 — no
	 * `load_plugin_textdomain()` call is needed for plugins hosted there.
	 */
	public function boot(): void {
		( new PostType() )->register();
		( new Admin\SettingsPage() )->register();
	}

	/**
	 * Block instantiation outside the singleton accessor.
	 */
	private function __construct() {}
}
