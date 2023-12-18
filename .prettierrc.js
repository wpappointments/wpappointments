// Import the default config file and expose it in the project root.
// Useful for editor integrations.
const config = require( '@wordpress/prettier-config' );

/** @type {import("prettier").Config} */
module.exports = {
	...config,
	overrides: [
		{
			files: [ 'assets/**/*.ts', 'assets/**/*.tsx' ],
			options: {
				parenSpacing: false,
			},
		},
	],
};
