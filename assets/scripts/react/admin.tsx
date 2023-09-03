import { render } from './utils/dom';
import Dashboard from './admin/pages/Dashboard';
import Schedules from './admin/pages/Schedules';
import { createHooks } from '@wordpress/hooks';
import Settings from './admin/pages/Settings';
import Calendar from './admin/pages/Calendar';

window.wpappointments = Object.assign( {} );
window.wpappointments.hooks = createHooks();

const pages = new Map( [
	[ 'dashboard', <Dashboard /> ],
	[ 'calendar', <Calendar /> ],
	[ 'schedules', <Schedules /> ],
	[ 'settings', <Settings /> ],
] );

render( pages );
