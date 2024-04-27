import path from 'path';

const js = (absolutePaths) => {
	const cwd = process.cwd();
	const relativePaths = absolutePaths.map((file) =>
		path.relative(cwd, file)
	);

	return [
		`pnpm format:js ${relativePaths.join(' ')}`,
		`pnpm lint:js ${relativePaths.join(' ')}`,
	];
};

const php = (absolutePaths) => {
	const cwd = process.cwd();
	const relativePaths = absolutePaths.map((file) =>
		path.relative(cwd, file)
	);

	return [
		`pnpm format:php ${relativePaths.join(' ')}`,
		`pnpm lint:php ${relativePaths.join(' ')}`,
	];
};

export default {
	'*.{js,ts,tsx,json,css}': js,
	'*.php': php,
};