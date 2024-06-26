<?php
/**
 * Plugin admin includes
 *
 * Require all admin files here
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments;

// exit if accessed directly.
defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/admin/api.php';
require_once __DIR__ . '/admin/menu.php';
require_once __DIR__ . '/admin/assets.php';
require_once __DIR__ . '/admin/other.php';
require_once __DIR__ . '/admin/roles.php';
