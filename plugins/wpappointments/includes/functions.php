<?php
/**
 * Plugin functions file
 *
 * Require all plugin files here
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments;

// exit if accessed directly.
defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/admin.php';
require_once __DIR__ . '/client.php';
require_once __DIR__ . '/notifications.php';
require_once __DIR__ . '/gutenberg.php';
require_once __DIR__ . '/debug.php';
