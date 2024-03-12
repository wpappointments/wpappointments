module.exports = {
	root: true,
	extends: [ 'plugin:@typescript-eslint/recommended' ],
	plugins: [ '@typescript-eslint', 'import' ],
	rules: {
		'@typescript-eslint/ban-ts-comment': 'off',
	},
};
