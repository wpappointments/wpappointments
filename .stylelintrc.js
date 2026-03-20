module.exports = {
	rules: {
		'at-rule-empty-line-before': [
			'always',
			{
				except: ['inside-block'],
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
