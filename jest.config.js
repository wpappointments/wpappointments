/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: {
		'~/backend/(.*)$': '<rootDir>/assets/backend/$1',
		'~/frontend/(.*)$': '<rootDir>/assets/backend/$1',
		'~/blocks/(.*)$': '<rootDir>/assets/gutenberg/blocks/$1',
		'~/images/(.*)$': '<rootDir>/assets/images/$1',
		'global.module.css': '<rootDir>/assets/styles/global.module.css',
	},
};
