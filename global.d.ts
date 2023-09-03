import { Hooks } from '@wordpress/hooks';
import { ReactDOM } from 'react';
import { createRoot } from 'react-dom/client';

declare global {
	interface Window {
		ReactDOM: ReactDOM & {
			createRoot: typeof createRoot;
		};
		wpappointments: {
			hooks: Hooks;
		};
	}
}
