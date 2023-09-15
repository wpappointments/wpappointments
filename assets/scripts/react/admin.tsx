import { createHooks } from '@wordpress/hooks';
import { render } from './utils/dom';
import Dashboard from './admin/pages/Dashboard';
import Schedules from './admin/pages/Schedules';
import Settings from './admin/pages/Settings/Settings';
import Calendar from './admin/pages/Calendar';
import '../redux/store';

window.wpappointments.hooks = createHooks();

const pages = new Map();
pages.set( 'dashboard', <Dashboard /> );
pages.set( 'calendar', <Calendar /> );
pages.set( 'schedules', <Schedules /> );
pages.set( 'settings', <Settings /> );

render( pages );
