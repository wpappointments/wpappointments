import path from 'path'

const format = (absolutePaths) => {
	const cwd = process.cwd()
	const relativePaths = absolutePaths.map((file) => path.relative(cwd, file))
	return `pnpm format ${relativePaths.join(' ')}`
}

export default {
  '*.js': format,
  '*.json': format,
  '*.ts': format,
  '*.tsx': format,
  '*.css': format,
  '*.css': (absolutePaths) => {
		const cwd = process.cwd()
		const relativePaths = absolutePaths.map((file) => path.relative(cwd, file))
		return `pnpm phpcs-fix ${relativePaths.join(' ')}`
	},
}