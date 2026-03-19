import { register } from '@wordpress/data';
import { createHooks } from '@wordpress/hooks';
import { render } from '~/backend/utils/dom';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import { OnboardingWizard } from './admin/pages/OnboardingWizard/OnboardingWizard';
import CardBody from '~/backend/admin/components/CardBody/CardBody';
import { DataViews } from '~/backend/admin/components/DataViews/DataViews';
import TableFullEmpty from '~/backend/admin/components/TableFullEmpty/TableFullEmpty';
// Export core UI components for external plugins.
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';
import Calendar from '~/backend/admin/pages/Calendar/Calendar';
import Customers from '~/backend/admin/pages/Customers/Customers';
import Dashboard from '~/backend/admin/pages/Dashboard/Dashboard';
import Settings from '~/backend/admin/pages/Settings/Settings';
import BookableListPage from '~/backend/bookable/BookableListPage';
import { registerBookableType } from '~/backend/bookable/registry';
import type { BookableTypeRegistration } from '~/backend/bookable/types';

window.wpappointments.hooks = createHooks();

// Expose core components so external plugins can build native-looking UIs.
(window.wpappointments as Record<string, unknown>).components = {
	LayoutDefault,
	CardBody,
	DataViews,
	TableFullEmpty,
	BookableListPage,
	useSlideout,
};

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
	pending.forEach((config) => registerBookableType(config));
}

register(store);
render(pages);
