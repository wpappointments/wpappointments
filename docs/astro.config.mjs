import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkMermaid from 'remark-mermaidjs';
// import starlightVersions from 'starlight-versions';
// Enable when first major version ships:
// plugins: [starlightVersions({ versions: [{ slug: '1.x', label: 'v1.x' }] })],

export default defineConfig({
	site: 'https://docs.wpappointments.com',
	markdown: {
		remarkPlugins: [
			[
				remarkMermaid,
				{
					mermaidConfig: {
						theme: 'neutral',
						themeVariables: {
							background: '#f9fafb',
							primaryColor: '#e0e7ff',
							primaryBorderColor: '#818cf8',
							lineColor: '#6366f1',
							textColor: '#1f2937',
							fontFamily: 'Inter, system-ui, sans-serif',
						},
					},
				},
			],
		],
	},
	integrations: [
		starlight({
			title: 'WP Appointments',
			social: {
				github: 'https://github.com/wpappointments/wpappointments',
			},
			editLink: {
				baseUrl:
					'https://github.com/wpappointments/wpappointments/edit/main/docs/',
			},
			plugins: [],
			customCss: ['./src/styles/custom.css'],
			// i18n: English only for now. To add a language:
			// 1. Uncomment the locale below
			// 2. Create docs at src/content/docs/<locale>/
			// 3. Translated UI labels go in src/content/i18n/<locale>.json
			// Available locales matching plugin translations:
			// de: Deutsch, es: Español, fr: Français, it: Italiano,
			// ja: 日本語, nl: Nederlands, pl: Polski, pt-br: Português (Brasil),
			// ru: Русский, zh-cn: 简体中文
			defaultLocale: 'root',
			locales: {
				root: { label: 'English', lang: 'en' },
				// de: { label: 'Deutsch', lang: 'de' },
				// es: { label: 'Español', lang: 'es' },
				// fr: { label: 'Français', lang: 'fr' },
				// it: { label: 'Italiano', lang: 'it' },
				// ja: { label: '日本語', lang: 'ja' },
				// nl: { label: 'Nederlands', lang: 'nl' },
				// pl: { label: 'Polski', lang: 'pl' },
				// 'pt-br': { label: 'Português (Brasil)', lang: 'pt-BR' },
				// ru: { label: 'Русский', lang: 'ru' },
				// 'zh-cn': { label: '简体中文', lang: 'zh-CN' },
			},
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Overview', link: '/developers/' },
						{
							label: 'Quick Start',
							link: '/developers/getting-started/',
						},
						{
							label: 'Architecture',
							link: '/developers/architecture/',
						},
					],
				},
				{
					label: 'Hooks Reference',
					autogenerate: { directory: 'developers/hooks' },
				},
				{
					label: 'REST API',
					autogenerate: { directory: 'developers/rest-api' },
				},
				{
					label: 'Addon Development',
					autogenerate: { directory: 'developers/addons' },
				},
				{
					label: 'Packages',
					items: [
						{ label: 'Overview', link: '/packages/' },
						{
							label: '@wpappointments/components',
							collapsed: true,
							items: [
								{
									label: 'Overview',
									link: '/packages/components/',
								},
								{
									label: 'Getting Started',
									link: '/packages/components/getting-started/',
								},
								{
									label: 'Form Fields',
									link: '/packages/components/form-fields/',
								},
								{
									label: 'Layout',
									link: '/packages/components/layout/',
								},
								{
									label: 'Data Views',
									link: '/packages/components/data-views/',
								},
								{
									label: 'API Reference',
									badge: { text: 'Auto', variant: 'note' },
									autogenerate: {
										directory:
											'packages/components/reference',
									},
								},
							],
						},
						{
							label: '@wpappointments/data',
							collapsed: true,
							items: [
								{
									label: 'Overview',
									link: '/packages/data/',
								},
								{
									label: 'Getting Started',
									link: '/packages/data/getting-started/',
								},
								{
									label: 'Hooks',
									link: '/packages/data/hooks/',
								},
								{
									label: 'API Client',
									link: '/packages/data/api-client/',
								},
								{
									label: 'Registry',
									link: '/packages/data/registry/',
								},
								{
									label: 'API Reference',
									badge: { text: 'Auto', variant: 'note' },
									autogenerate: {
										directory: 'packages/data/reference',
									},
								},
							],
						},
					],
				},
			],
		}),
	],
});
