import { register } from '@wordpress/data';
import { createHooks } from '@wordpress/hooks';
import { render } from '~/utils/dom';
import { store } from '~/store/store';
import Calendar from '~/admin/pages/Calendar/Calendar';
import Dashboard from '~/admin/pages/Dashboard/Dashboard';
import Settings from '~/admin/pages/Settings/Settings';

window.wpappointments.hooks = createHooks();

const pages = new Map<string, React.JSX.Element>();
pages.set('dashboard', <Dashboard />);
pages.set('calendar', <Calendar />);
pages.set('settings', <Settings />);

register(store);
render(pages);
