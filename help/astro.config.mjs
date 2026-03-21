import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	site: 'https://wpappointments.com',
	base: '/help',
	vite: {
		plugins: [tailwindcss()],
	},
	markdown: {
		shikiConfig: {
			theme: 'github-light',
		},
	},
});
