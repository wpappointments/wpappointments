module.exports = {
	rules: {
		'at-rule-empty-line-before': [
			'always',
			{
				except: ['inside-block'],
			},
		],
		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: ['theme', 'apply', 'layer', 'config'],
			},
		],
		'scss/at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: ['theme', 'apply', 'layer', 'config'],
			},
		],
		'selector-pseudo-class-no-unknown': [
			true,
			{
				ignorePseudoClasses: ['global'],
			},
		],
	},
};
