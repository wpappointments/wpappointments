<?php
/**
 * Holiday registry
 *
 * Manages the wpappointments_holiday_groups option: which holiday sets
 * are enabled and which individual holidays are excluded.
 *
 * Reads source files from data/holidays/sources/ and resolves holiday
 * refs against data/holidays/definitions.json at runtime.
 *
 * @package WPAppointments
 * @since 0.6.0
 */

namespace WPAppointments\Holidays;

/**
 * Holiday registry class
 */
class HolidayRegistry {
	/**
	 * Option name for stored holiday groups
	 */
	const OPTION_KEY = 'wpappointments_holiday_groups';

	/**
	 * Allowed group types
	 */
	const ALLOWED_TYPES = array( 'country', 'religious' );

	/**
	 * Cached definitions (loaded once per request)
	 *
	 * @var array|null
	 */
	private static ?array $definitions = null;

	/**
	 * Get all saved holiday groups
	 *
	 * @return array
	 */
	public static function get_groups(): array {
		$groups = get_option( self::OPTION_KEY, array() );

		if ( ! is_array( $groups ) ) {
			return array();
		}

		return $groups;
	}

	/**
	 * Save holiday groups
	 *
	 * @param array $groups Groups to save.
	 *
	 * @return bool
	 */
	public static function save_groups( array $groups ): bool {
		return update_option( self::OPTION_KEY, $groups );
	}

	/**
	 * Get available country holiday sets
	 *
	 * @return array Array of [ 'id' => string, 'name' => string ].
	 */
	public static function get_available_countries(): array {
		return self::get_available_by_type( 'country' );
	}

	/**
	 * Get available religious holiday sets
	 *
	 * @return array Array of [ 'id' => string, 'name' => string ].
	 */
	public static function get_available_religious(): array {
		return self::get_available_by_type( 'religious' );
	}

	/**
	 * Add a holiday group
	 *
	 * @param array $data Group data with 'type' and 'file_id' (e.g. 'PL' or 'christian').
	 *
	 * @return array|\WP_Error Updated groups array or error.
	 */
	public static function add_group( array $data ) {
		$type    = sanitize_text_field( $data['type'] ?? '' );
		$file_id = sanitize_file_name( $data['file_id'] ?? '' );

		if ( ! in_array( $type, self::ALLOWED_TYPES, true ) ) {
			return new \WP_Error(
				'invalid_type',
				__( 'Invalid holiday group type.', 'wpappointments' ),
				array( 'status' => 422 )
			);
		}

		$source = self::read_source_file( $file_id );

		if ( null === $source ) {
			return new \WP_Error(
				'file_not_found',
				__( 'Holiday data file not found.', 'wpappointments' ),
				array( 'status' => 404 )
			);
		}

		$source_type = $source['type'] ?? '';

		if ( $source_type !== $type ) {
			return new \WP_Error(
				'type_mismatch',
				__( 'Source file type does not match requested type.', 'wpappointments' ),
				array( 'status' => 422 )
			);
		}

		$group_id = $type . '_' . $file_id;
		$groups   = self::get_groups();

		foreach ( $groups as $group ) {
			if ( ( $group['id'] ?? '' ) === $group_id ) {
				return new \WP_Error(
					'duplicate_group',
					__( 'This holiday group is already added.', 'wpappointments' ),
					array( 'status' => 422 )
				);
			}
		}

		$groups[] = array(
			'id'       => $group_id,
			'type'     => $type,
			'source'   => $file_id,
			'label'    => $source['name'] ?? $file_id,
			'enabled'  => true,
			'excluded' => array(),
		);

		self::save_groups( $groups );
		self::invalidate_cache();

		return $groups;
	}

	/**
	 * Remove a holiday group
	 *
	 * @param string $group_id Group ID to remove.
	 *
	 * @return array|\WP_Error Updated groups array or error.
	 */
	public static function remove_group( string $group_id ) {
		$groups  = self::get_groups();
		$found   = false;
		$updated = array();

		foreach ( $groups as $group ) {
			if ( ( $group['id'] ?? '' ) === $group_id ) {
				$found = true;
				continue;
			}
			$updated[] = $group;
		}

		if ( ! $found ) {
			return new \WP_Error(
				'group_not_found',
				__( 'Holiday group not found.', 'wpappointments' ),
				array( 'status' => 404 )
			);
		}

		self::save_groups( $updated );
		self::invalidate_cache();

		return $updated;
	}

	/**
	 * Toggle a holiday group on or off
	 *
	 * @param string $group_id Group ID.
	 * @param bool   $enabled  Whether enabled.
	 *
	 * @return array|\WP_Error Updated groups array or error.
	 */
	public static function toggle_group( string $group_id, bool $enabled ) {
		$groups = self::get_groups();
		$found  = false;

		foreach ( $groups as &$group ) {
			if ( ( $group['id'] ?? '' ) === $group_id ) {
				$group['enabled'] = $enabled;
				$found            = true;
				break;
			}
		}
		unset( $group );

		if ( ! $found ) {
			return new \WP_Error(
				'group_not_found',
				__( 'Holiday group not found.', 'wpappointments' ),
				array( 'status' => 404 )
			);
		}

		self::save_groups( $groups );
		self::invalidate_cache();

		return $groups;
	}

	/**
	 * Toggle an individual holiday within a group
	 *
	 * Only meaningful for the owning group (first enabled group with the ref).
	 * Later groups' excluded lists for the same ref are ignored at runtime.
	 *
	 * @param string $group_id     Group ID.
	 * @param string $holiday_ref  Holiday ref.
	 * @param bool   $enabled      Whether enabled.
	 *
	 * @return array|\WP_Error Updated groups array or error.
	 */
	public static function toggle_holiday( string $group_id, string $holiday_ref, bool $enabled ) {
		$groups = self::get_groups();
		$found  = false;

		foreach ( $groups as &$group ) {
			if ( ( $group['id'] ?? '' ) !== $group_id ) {
				continue;
			}

			$found    = true;
			$excluded = $group['excluded'] ?? array();

			if ( $enabled ) {
				$excluded = array_values( array_diff( $excluded, array( $holiday_ref ) ) );
			} elseif ( ! in_array( $holiday_ref, $excluded, true ) ) {
				$excluded[] = $holiday_ref;
			}

			$group['excluded'] = $excluded;
			break;
		}
		unset( $group );

		if ( ! $found ) {
			return new \WP_Error(
				'group_not_found',
				__( 'Holiday group not found.', 'wpappointments' ),
				array( 'status' => 404 )
			);
		}

		self::save_groups( $groups );
		self::invalidate_cache();

		return $groups;
	}

	/**
	 * Get all groups enriched with resolved holidays and computed dates
	 *
	 * @return array Groups with 'holidays' key containing resolved + dated holidays.
	 */
	public static function get_groups_with_holidays(): array {
		$groups       = self::get_groups();
		$current_year = (int) gmdate( 'Y' );
		$next_year    = $current_year + 1;

		foreach ( $groups as &$group ) {
			$holidays = self::resolve_group_holidays( $group );
			$excluded = $group['excluded'] ?? array();

			$group['holidays'] = array_map(
				function ( $holiday ) use ( $excluded, $current_year, $next_year ) {
					$holiday['enabled'] = ! in_array( $holiday['ref'] ?? '', $excluded, true );
					$holiday['dates']   = array(
						$current_year => HolidayResolver::compute_date( $holiday, $current_year ),
						$next_year    => HolidayResolver::compute_date( $holiday, $next_year ),
					);
					return $holiday;
				},
				$holidays
			);
		}
		unset( $group );

		return $groups;
	}

	/**
	 * Get all effective holidays across all groups (ref-deduped)
	 *
	 * First enabled group to contain a ref owns it. If the owner has it
	 * excluded, it's off for everyone. Later groups never override.
	 *
	 * Used by the availability layer.
	 *
	 * @return array Resolved holiday definitions that should block dates.
	 */
	public static function get_all_effective_holidays(): array {
		$groups    = self::get_groups();
		$claimed   = array();
		$effective = array();

		foreach ( $groups as $group ) {
			if ( empty( $group['enabled'] ) ) {
				continue;
			}

			$holidays = self::resolve_group_holidays( $group );
			$excluded = $group['excluded'] ?? array();

			foreach ( $holidays as $holiday ) {
				$ref = $holiday['ref'] ?? '';

				if ( '' === $ref || isset( $claimed[ $ref ] ) ) {
					continue;
				}

				$claimed[ $ref ] = true;

				if ( ! in_array( $ref, $excluded, true ) ) {
					$effective[] = $holiday;
				}
			}
		}

		return $effective;
	}

	/**
	 * Invalidate holiday date caches
	 *
	 * @return void
	 */
	public static function invalidate_cache(): void {
		$current_year = (int) gmdate( 'Y' );

		for ( $year = $current_year; $year <= $current_year + 1; $year++ ) {
			delete_transient( 'wpappointments_holidays_' . $year );
		}
	}

	/**
	 * Resolve holidays for a group from source + definitions
	 *
	 * @param array $group Group data with 'source' key.
	 *
	 * @return array Resolved holiday definitions.
	 */
	private static function resolve_group_holidays( array $group ): array {
		$source_id = $group['source'] ?? '';
		$source    = self::read_source_file( $source_id );

		if ( null === $source ) {
			return array();
		}

		$definitions = self::get_definitions();
		$refs        = $source['holidays'] ?? array();
		$resolved    = array();

		foreach ( $refs as $ref ) {
			if ( ! is_string( $ref ) || '' === $ref ) {
				continue;
			}

			if ( ! isset( $definitions[ $ref ] ) ) {
				continue;
			}

			$def        = $definitions[ $ref ];
			$resolved[] = array_merge( array( 'ref' => $ref ), $def );
		}

		return $resolved;
	}

	/**
	 * Get available sets filtered by type
	 *
	 * @param string $type 'country' or 'religious'.
	 *
	 * @return array Array of [ 'id' => string, 'name' => string ].
	 */
	private static function get_available_by_type( string $type ): array {
		$dir = self::data_dir() . 'sources';

		if ( ! is_dir( $dir ) ) {
			return array();
		}

		$files = glob( $dir . '/*.json' );

		if ( false === $files ) {
			return array();
		}

		$sets = array();

		foreach ( $files as $file_path ) {
			$raw = file_get_contents( $file_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Reading local static data file, not a remote URL.

			if ( false === $raw ) {
				continue;
			}

			$data = json_decode( $raw, true );

			if ( ! is_array( $data ) || empty( $data['id'] ) ) {
				continue;
			}

			if ( ( $data['type'] ?? '' ) !== $type ) {
				continue;
			}

			$sets[] = array(
				'id'   => $data['id'],
				'name' => $data['name'] ?? $data['id'],
			);
		}

		usort(
			$sets,
			function ( $a, $b ) {
				return strcmp( $a['name'], $b['name'] );
			}
		);

		return $sets;
	}

	/**
	 * Load and cache the definitions file
	 *
	 * @return array Holiday definitions keyed by ref.
	 */
	private static function get_definitions(): array {
		if ( null !== self::$definitions ) {
			return self::$definitions;
		}

		$file_path = self::data_dir() . 'definitions.json';
		$real_path = realpath( $file_path );

		if ( false === $real_path ) {
			self::$definitions = array();
			return self::$definitions;
		}

		$raw = file_get_contents( $real_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Reading local static data file, not a remote URL.

		if ( false === $raw ) {
			self::$definitions = array();
			return self::$definitions;
		}

		$data = json_decode( $raw, true );

		self::$definitions = is_array( $data ) ? $data : array();

		return self::$definitions;
	}

	/**
	 * Read a source file by ID
	 *
	 * @param string $source_id Source file ID (filename without extension).
	 *
	 * @return array|null Decoded source data or null.
	 */
	private static function read_source_file( string $source_id ): ?array {
		$file_path = self::data_dir() . 'sources/' . $source_id . '.json';

		$real_path = realpath( $file_path );
		$real_dir  = realpath( self::data_dir() );

		if ( false === $real_path || false === $real_dir ) {
			return null;
		}

		if ( 0 !== strpos( $real_path, $real_dir ) ) {
			return null;
		}

		$raw = file_get_contents( $real_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Reading local static data file, not a remote URL.

		if ( false === $raw ) {
			return null;
		}

		$data = json_decode( $raw, true );

		if ( ! is_array( $data ) ) {
			return null;
		}

		return $data;
	}

	/**
	 * Get the holiday data directory path
	 *
	 * Points to the @wpappointments/holidays package data directory.
	 *
	 * @return string
	 */
	private static function data_dir(): string {
		return WP_CONTENT_DIR . '/packages/holidays/data/';
	}
}
