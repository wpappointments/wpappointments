import { createRoot } from 'react-dom/client';
import { createHooks } from '@wordpress/hooks';
import { useAppointments } from './hooks/api/appointments';

window.wpappointments.hooks = createHooks();

function Globals() {
	useAppointments();
	return null;
}

const domElement = document.getElementById('wpappointments-globals');

if (domElement) {
	createRoot(domElement).render(<Globals />);
}
