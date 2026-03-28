const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');
const path = require('path');

// Packages that @wordpress/dataviews depends on but aren't registered
// as script handles in WordPress 6.8. Force-bundle them instead of
// externalizing. Uses startsWith to catch subpath imports (e.g.
// @wordpress/dataviews/build-style/style.css).
// Note: @wordpress/private-apis and @wordpress/warning ARE in WP 6.8
// and must stay externalized (private-apis uses a shared lock registry).
const FORCE_BUNDLED_PREFIXES = [
	'@wordpress/ui',
	'@wordpress/theme',
	'@wordpress/dataviews',
];

function shouldForceBundleRequest(request) {
	return FORCE_BUNDLED_PREFIXES.some((prefix) =>
		request.startsWith(prefix)
	);
}

const findCssRule = (rule) => rule.test.toString() === '/\\.css$/';
const cssRule = defaultConfig.module.rules.find(findCssRule);
const cssLoader = cssRule.use.find((loader) =>
	loader.loader.includes('css-loader')
);

cssLoader.options.modules = {
	mode: 'local',
	auto: true,
	exportGlobals: true,
	localIdentName: '[name]__[local]',
	localIdentContext: path.resolve(__dirname, 'src'),
	localIdentHashSalt: 'my-custom-hash',
	namedExport: false,
	exportLocalsConvention: 'camelCaseOnly',
	exportOnlyLocals: false,
};

defaultConfig.resolve.alias = {
	...defaultConfig.resolve.alias,
	'~/backend': path.resolve(__dirname, 'assets/backend'),
	'~/frontend': path.resolve(__dirname, 'assets/frontend'),
	'~/blocks': path.resolve(__dirname, 'assets/gutenberg/blocks'),
	'~/images': path.resolve(__dirname, 'assets/images'),
	'global.module.css': path.resolve(
		__dirname,
		'assets/styles/global.module.css'
	),
};

// Replace the default DependencyExtractionWebpackPlugin with one that
// force-bundles packages not available in our target WP version.
const plugins = defaultConfig.plugins.filter(
	(plugin) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
);

plugins.push(
	new DependencyExtractionWebpackPlugin({
		requestToExternal(request) {
			if (shouldForceBundleRequest(request)) {
				return false; // bundle instead of externalizing
			}
		},
	})
);

module.exports = {
	...defaultConfig,
	plugins,
};
