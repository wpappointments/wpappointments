import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(__dirname, '..');

const configs = [
	{
		name: '@wpappointments/components',
		config: resolve(docsRoot, 'typedoc-components.json'),
		packageJson: resolve(docsRoot, '..', 'packages/components/package.json'),
	},
	{
		name: '@wpappointments/data',
		config: resolve(docsRoot, 'typedoc-data.json'),
		packageJson: resolve(docsRoot, '..', 'packages/data/package.json'),
	},
];

for (const { name, config, packageJson } of configs) {
	const pkg = JSON.parse(readFileSync(packageJson, 'utf-8'));
	console.log(`Generating API reference for ${name} v${pkg.version}...`);

	try {
		execSync(`npx typedoc --options ${config}`, {
			cwd: docsRoot,
			stdio: 'inherit',
		});
		console.log(`Done: ${name}`);
	} catch (error) {
		console.error(`Failed to generate docs for ${name}:`, error.message);
		console.log('Skipping — TypeDoc generation is optional for build.');
	}
}
