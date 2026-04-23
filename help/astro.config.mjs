import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import remarkMermaid from 'remark-mermaidjs';

export default defineConfig({
	site: 'https://wpappointments.com',
	base: '/help',
	vite: {
		plugins: [tailwindcss()],
	},
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
		shikiConfig: {
			theme: 'github-light',
		},
	},
});
