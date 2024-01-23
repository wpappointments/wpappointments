/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: {
		'~/(.*)$': '<rootDir>/assets/scripts/$1',
		'global.module.css': '<rootDir>/assets/styles/global.module.css',
	},
};
