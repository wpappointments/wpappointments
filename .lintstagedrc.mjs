import path from 'path';


const js = (absolutePaths) => {
	const cwd = process.cwd();
	const relativePaths = absolutePaths.map((file) =>
		path.relative(cwd, file)
	);
	const jsRelativePaths = relativePaths.filter((file) => !file.endsWith('.css'));

	const commands = [
		`wp-scripts format ${relativePaths.join(' ')}`,
		`lerna run check-types`,
	];

	if (jsRelativePaths.length > 0) {
		commands.splice(1, 0, `wp-scripts lint-js ${jsRelativePaths.join(' ')}`);
	}

	return commands;
};

const php = (absolutePaths) => {
	const cwd = process.cwd();
	const relativePaths = absolutePaths
		.map((file) => path.relative(cwd, file))
		.filter((file) => !file.startsWith('.mu-plugins'));

	if (relativePaths.length === 0) {
		return [
			'pnpm echo 1'
		];
	}

	return [
		`pnpm phpcbf ${relativePaths.join(' ')}`,
		`pnpm phpcs ${relativePaths.join(' ')}`,
	];
};

export default {
	'*.{js,ts,tsx,json,css}': js,
	'*.php': php,
};