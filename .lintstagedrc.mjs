import path from 'path';

const format = (absolutePaths) => {
	const cwd = process.cwd();
	const relativePaths = absolutePaths.map((file) =>
		path.relative(cwd, file)
	);

	return `pnpm format:js ${relativePaths.join(' ')}`;
};

const formatPHP = (absolutePaths) => {
	const cwd = process.cwd();
	const relativePaths = absolutePaths.map((file) =>
		path.relative(cwd, file)
	);

	return `pnpm format:php ${relativePaths.join(' ')}`;
};

export default {
	'*.js': format,
	'*.json': format,
	'*.ts': format,
	'*.tsx': format,
	'*.css': format,
	'*.php': formatPHP,
};
