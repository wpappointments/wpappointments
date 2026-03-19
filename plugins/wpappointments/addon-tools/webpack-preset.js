/**
 * WP Appointments Addon Webpack Preset
 *
 * Extends @wordpress/scripts default webpack config to externalize
 * WP Appointments shared components. This ensures addon plugins use
 * the same React instance and shared components from core instead of
 * bundling their own copies.
 *
 * Usage in addon plugin's webpack.config.js:
 *
 *   const defaultConfig = require('@wordpress/scripts/config/webpack.config');
 *   const wpaPreset = require('wpappointments/addon-tools/webpack-preset');
 *   module.exports = wpaPreset(defaultConfig);
 *
 * Or with custom overrides:
 *
 *   const defaultConfig = require('@wordpress/scripts/config/webpack.config');
 *   const wpaPreset = require('wpappointments/addon-tools/webpack-preset');
 *   module.exports = {
 *       ...wpaPreset(defaultConfig),
 *       entry: { admin: './src/admin.tsx' },
 *   };
 */

/**
 * Map of WP Appointments modules to their window globals.
 *
 * When addon code imports '@wpappointments/components', webpack replaces
 * it with window.wpappointments.components at runtime. No bundling needed.
 */
const wpaExternals = {
	'@wpappointments/components': ['wpappointments', 'components'],
	'@wpappointments/hooks': ['wpappointments', 'hooks'],
	'@wpappointments/api': ['wpappointments', 'api'],
};

/**
 * Script handles that wp-scripts dependency extraction should recognize.
 * When an addon imports '@wpappointments/components', the generated
 * .asset.php file should list 'wpappointments-shared-js' as a dependency.
 */
const wpaDependencyMapping = {
	'@wpappointments/components': 'wpappointments-shared-js',
	'@wpappointments/hooks': 'wpappointments-admin-js',
	'@wpappointments/api': 'wpappointments-shared-js',
};

function applyPreset(defaultConfig) {
	const existingExternals = defaultConfig.externals || {};

	return {
		...defaultConfig,
		externals: {
			...(typeof existingExternals === 'object' &&
			!Array.isArray(existingExternals)
				? existingExternals
				: {}),
			...wpaExternals,
		},
	};
}

applyPreset.externals = wpaExternals;
applyPreset.dependencyMapping = wpaDependencyMapping;

module.exports = applyPreset;
