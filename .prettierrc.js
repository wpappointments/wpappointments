// Import the default config file and expose it in the project root.
// Useful for editor integrations.
const config = require( '@wordpress/prettier-config' );

/** @type {import("prettier").Config} */
module.exports = {
	...config,
	importOrder: [
		'^react$',
		'^react-dom$',
		'^react-dom/(.*)$',
		'^react-hook-form$',
		'<THIRD_PARTY_MODULES>',
		'~/utils/',
		'~/hooks/',
		'~/store/',
		'~/layouts/',
		'~/components/',
		'~/types',
		'^../(.*)$',
		'^./(.*)$',
		'./(.*).module.css',
		'(.*).module.css',
		'.svg',
	],
	plugins: [ '@trivago/prettier-plugin-sort-imports' ],
	overrides: [
		{
			files: [ 'assets/**/*.ts', 'assets/**/*.tsx' ],
			options: {
				parenSpacing: false,
			},
		},
	],
};
