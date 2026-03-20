const defaultConfig = require('@wordpress/scripts/config/webpack.config');

// Map @wpappointments/* imports to window.wpappointments.* globals.
const wpappointmentsExternals = {
	'@wpappointments/components': ['wpappointments', 'components'],
	'@wpappointments/data': ['wpappointments', 'data'],
};

module.exports = {
	...defaultConfig,
	externals: [
		...(Array.isArray(defaultConfig.externals)
			? defaultConfig.externals
			: defaultConfig.externals
				? [defaultConfig.externals]
				: []),
		wpappointmentsExternals,
	],
};
