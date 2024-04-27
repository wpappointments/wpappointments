import path from 'path';


const js = (absolutePaths) => {
	const cwd = process.cwd();
	const relativePaths = absolutePaths.map((file) =>
		path.relative(cwd, file)
	);

	return [
		`wp-scripts lint-js ${relativePaths.join(' ')}`,
		`wp-scripts lint-js ${relativePaths.join(' ')}`,
	];
};

const php = (absolutePaths) => {
	const cwd = process.cwd();
	const relativePaths = absolutePaths
		.map((file) => path.relative(cwd, file))
		.filter((file) => !file.startsWith('.mu-plugins'));
	console.log(relativePaths);
	return [
		'pnpm echo 1'
	];

	return [
		`pnpm phpcbf ${relativePaths.join(' ')}`,
		`pnpm phpcs ${relativePaths.join(' ')}`,
	];
};

export default {
	'*.{js,ts,tsx,json,css}': js,
	'*.php': php,
};