import { createHooks } from '@wordpress/hooks';
import { render } from '~/utils/dom';
import Dashboard from '~/admin/pages/Dashboard';
import Settings from '~/admin/pages/Settings/Settings';
import Calendar from '~/admin/pages/Calendar/Calendar';
import '~/store/store';

window.wpappointments.hooks = createHooks();

const pages = new Map<string, React.JSX.Element>();
pages.set('dashboard', <Dashboard />);
pages.set('calendar', <Calendar />);
pages.set('settings', <Settings />);

render(pages);