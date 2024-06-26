const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

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

module.exports = {
	...defaultConfig,
};
