<?php
/**
 * Plugin info class file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Core;

/**
 * Stores plugin information
 */
class PluginInfo extends Singleton {
	/**
	 * Plugin version
	 *
	 * @var string
	 */
	const VERSION = '0.0.1';

	/**
	 * Plugin API namespace
	 *
	 * @var string
	 */
	const API_NAMESPACE = 'wpappointments/v1';

	/**
	 * Required PHP version
	 *
	 * @var string
	 */
	const REQUIRED_PHP = '7.4';

	/**
	 * Plugin file path
	 *
	 * @var string
	 */
	const PLUGIN_FILE = WPAPPOINTMENTS_FILE;

	/**
	 * Plugin directory path
	 *
	 * @var string
	 */
	const PLUGIN_DIR_PATH = WPAPPOINTMENTS_DIR_PATH;

	/**
	 * Plugin directory URL
	 *
	 * @var string
	 */
	const PLUGIN_DIR_URL = WPAPPOINTMENTS_DIR_URL;

	/**
	 * Plugin available post types
	 */
	const POST_TYPES = array(
		'appointment'     => 'wpa-appointment',
		'schedule'        => 'wpa-schedule',
		'service'         => 'wpa-service',
		'service-variant' => 'wpa-service-variant',
	);

	/**
	 * Get plugin version
	 *
	 * @return string
	 */
	public static function get_version() {
		return self::VERSION;
	}

	/**
	 * Get plugin API namespace
	 *
	 * @return string
	 */
	public static function get_api_namespace() {
		return self::API_NAMESPACE;
	}

	/**
	 * Get required PHP version
	 *
	 * @return string
	 */
	public static function get_required_php() {
		return self::REQUIRED_PHP;
	}

	/**
	 * Get plugin file path
	 *
	 * @return string
	 */
	public static function get_plugin_file() {
		return self::PLUGIN_FILE;
	}

	/**
	 * Get plugin directory path
	 *
	 * @return string
	 */
	public static function get_plugin_dir_path() {
		return self::PLUGIN_DIR_PATH;
	}

	/**
	 * Get plugin directory URL
	 *
	 * @return string
	 */
	public static function get_plugin_dir_url() {
		return self::PLUGIN_DIR_URL;
	}

	/**
	 * Check if the required PHP version is met
	 *
	 * @return bool
	 */
	public static function is_php_version_met() {
		return version_compare( phpversion(), self::REQUIRED_PHP, '>=' );
	}
}
