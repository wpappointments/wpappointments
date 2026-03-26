#!/usr/bin/env node

/**
 * Validate holiday source files against definitions.
 *
 * Checks that all refs in source files exist in definitions.json
 * and that all source files have required fields.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../data');

const definitions = JSON.parse(
	readFileSync(join(dataDir, 'definitions.json'), 'utf-8')
);

const subdirs = ['countries', 'religious'];
let errors = 0;

for (const subdir of subdirs) {
	const dir = join(dataDir, 'sources', subdir);

	if (!existsSync(dir)) {
		continue;
	}

	const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

	for (const file of files) {
		const source = JSON.parse(readFileSync(join(dir, file), 'utf-8'));
		const { id, name, type, holidays } = source;

		if (!id || !name || !type || !holidays) {
			console.error(`[ERROR] ${subdir}/${file}: missing required fields (id, name, type, holidays)`);
			errors++;
			continue;
		}

		if (!['country', 'religious'].includes(type)) {
			console.error(`[ERROR] ${subdir}/${file}: invalid type "${type}"`);
			errors++;
		}

		for (const ref of holidays) {
			if (typeof ref !== 'string' || ref === '') {
				console.error(`[ERROR] ${subdir}/${file}: holiday entry must be a non-empty string, got: ${JSON.stringify(ref)}`);
				errors++;
				continue;
			}

			if (!definitions[ref]) {
				console.error(`[ERROR] ${subdir}/${file}: unknown ref "${ref}" — not in definitions.json`);
				errors++;
			}
		}

		console.log(`[OK] ${subdir}/${file} — ${holidays.length} holidays`);
	}
}

if (errors > 0) {
	console.error(`\n${errors} error(s) found.`);
	process.exit(1);
} else {
	console.log('\nAll source files valid.');
}
