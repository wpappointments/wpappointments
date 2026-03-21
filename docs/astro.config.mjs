import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
// import starlightVersions from 'starlight-versions';
// Enable when first major version ships:
// plugins: [starlightVersions({ versions: [{ slug: '1.x', label: 'v1.x' }] })],

export default defineConfig({
	site: 'https://docs.wpappointments.com',
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
					label: 'User Guides',
					items: [
						{ label: 'Getting Started', link: '/guides/' },
						{ label: 'Installation', link: '/guides/installation/' },
						{
							label: 'Appointments',
							collapsed: true,
							autogenerate: { directory: 'guides/appointments' },
						},
						{
							label: 'Bookables',
							collapsed: true,
							autogenerate: { directory: 'guides/bookables' },
						},
						{
							label: 'Availability',
							collapsed: true,
							autogenerate: { directory: 'guides/availability' },
						},
						{
							label: 'Customers',
							collapsed: true,
							autogenerate: { directory: 'guides/customers' },
						},
						{
							label: 'Notifications',
							collapsed: true,
							autogenerate: { directory: 'guides/notifications' },
						},
						{
							label: 'Booking Flow',
							collapsed: true,
							autogenerate: { directory: 'guides/booking-flow' },
						},
						{
							label: 'Settings',
							collapsed: true,
							autogenerate: { directory: 'guides/settings' },
						},
						{
							label: 'Premium Features',
							badge: { text: 'Premium', variant: 'tip' },
							collapsed: true,
							autogenerate: { directory: 'guides/premium' },
						},
					],
				},
				{
					label: 'Developer Docs',
					items: [
						{ label: 'Overview', link: '/developers/' },
						{
							label: 'Getting Started',
							link: '/developers/getting-started/',
						},
						{
							label: 'Architecture',
							link: '/developers/architecture/',
						},
						{
							label: 'Hooks Reference',
							collapsed: true,
							autogenerate: { directory: 'developers/hooks' },
						},
						{
							label: 'REST API',
							collapsed: true,
							autogenerate: { directory: 'developers/rest-api' },
						},
						{
							label: 'Addon Development',
							collapsed: true,
							autogenerate: { directory: 'developers/addons' },
						},
					],
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
