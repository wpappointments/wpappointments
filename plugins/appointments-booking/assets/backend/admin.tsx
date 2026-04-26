import { register } from '@wordpress/data';
import { createHooks } from '@wordpress/hooks';
import * as components from '@wpappointments/components';
import * as data from '@wpappointments/data';
import type { BookableTypeRegistration } from '@wpappointments/data';
import { render } from '~/backend/utils/dom';
import { store } from '~/backend/store/store';
import { OnboardingWizard } from './admin/pages/OnboardingWizard/OnboardingWizard';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';
import Calendar from '~/backend/admin/pages/Calendar/Calendar';
import Customers from '~/backend/admin/pages/Customers/Customers';
import Dashboard from '~/backend/admin/pages/Dashboard/Dashboard';
import Settings from '~/backend/admin/pages/Settings/Settings';

window.wpappointments.hooks = createHooks();

// Expose packages on window for external plugin consumption via externals.
(window.wpappointments as Record<string, unknown>).components = {
	...components,
	LayoutDefault,
};
(window.wpappointments as Record<string, unknown>).data = data;

const pages = new Map<string, React.JSX.Element>();
pages.set('dashboard', <Dashboard />);
pages.set('calendar', <Calendar />);
pages.set('customers', <Customers />);
pages.set('settings', <Settings />);
pages.set('wizard', <OnboardingWizard />);

// Process pending bookable type registrations from external plugins.
// Plugins push to this array before the core admin script loads (via the
// wpappointments_admin_js_dependencies filter).
const pending = (window.wpappointments as Record<string, unknown>)
	?._pendingBookableTypes as BookableTypeRegistration[] | undefined;

if (Array.isArray(pending)) {
	pending.forEach((config) => data.registerBookableType(config));
}

register(store);
render(pages);
