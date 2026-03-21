import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(__dirname, '..');
const pluginSrc = resolve(docsRoot, '..', 'plugins/wpappointments/src');
const hooksDir = resolve(docsRoot, 'src/content/docs/developers/hooks');

const ACTION_REGEX = /do_action\(\s*'([^']+)'/g;
const FILTER_REGEX = /apply_filters\(\s*'([^']+)'/g;

function findPhpFiles(dir) {
	const files = [];
	for (const entry of readdirSync(dir)) {
		const full = resolve(dir, entry);
		if (statSync(full).isDirectory()) {
			files.push(...findPhpFiles(full));
		} else if (full.endsWith('.php')) {
			files.push(full);
		}
	}
	return files;
}

function extractHooks(files, regex) {
	const hooks = [];
	for (const file of files) {
		const content = readFileSync(file, 'utf-8');
		const lines = content.split('\n');

		for (let i = 0; i < lines.length; i++) {
			const match = regex.exec(lines[i]);
			if (match) {
				const hookName = match[1];
				const relPath = relative(resolve(docsRoot, '..'), file);
				const lineNum = i + 1;

				// Extract PHPDoc comment above (if present)
				let description = '';
				if (i > 0 && lines[i - 1].trim().endsWith('*/')) {
					let j = i - 1;
					const docLines = [];
					while (j >= 0 && !lines[j].trim().startsWith('/**')) {
						docLines.unshift(lines[j].trim().replace(/^\*\s?/, '').replace(/\*\//, ''));
						j--;
					}
					if (j >= 0) {
						docLines.unshift(lines[j].trim().replace(/\/\*\*\s?/, ''));
					}
					description = docLines.filter(Boolean).join(' ').trim();
				}

				hooks.push({ name: hookName, file: relPath, line: lineNum, description });
			}
			// Reset regex lastIndex for global regex
			regex.lastIndex = 0;
		}
	}
	return hooks.sort((a, b) => a.name.localeCompare(b.name));
}

function generateMdx(title, description, hooks, type) {
	let mdx = `---
title: ${title}
description: ${description}
sidebar:
  order: ${type === 'action' ? 1 : 2}
  badge:
    text: Auto
    variant: note
---

:::note
This page is auto-generated from the plugin source code. Do not edit manually — run \`pnpm docs:generate\` to update.
:::

`;

	if (hooks.length === 0) {
		mdx += `No ${title.toLowerCase()} found in the current source code.\n`;
		return mdx;
	}

	for (const hook of hooks) {
		mdx += `## \`${hook.name}\`\n\n`;
		if (hook.description) {
			mdx += `${hook.description}\n\n`;
		}
		mdx += `**Source:** \`${hook.file}:${hook.line}\`\n\n`;
		mdx += `---\n\n`;
	}

	return mdx;
}

// Main
console.log('Extracting hooks from PHP source...');
const phpFiles = findPhpFiles(pluginSrc);
console.log(`Found ${phpFiles.length} PHP files`);

const actions = extractHooks(phpFiles, ACTION_REGEX);
const filters = extractHooks(phpFiles, FILTER_REGEX);

console.log(`Found ${actions.length} actions, ${filters.length} filters`);

writeFileSync(
	resolve(hooksDir, 'actions.mdx'),
	generateMdx('Actions', 'WordPress actions provided by WP Appointments.', actions, 'action')
);

writeFileSync(
	resolve(hooksDir, 'filters.mdx'),
	generateMdx('Filters', 'WordPress filters provided by WP Appointments.', filters, 'filter')
);

console.log('Hooks reference generated.');
