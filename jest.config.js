/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: {
		'~/(.*)$': '<rootDir>/assets/backend/$1',
		'global.module.css': '<rootDir>/assets/styles/global.module.css',
	},
};
