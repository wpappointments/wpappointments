import { register } from '@wordpress/data';
import { createHooks } from '@wordpress/hooks';
import { render } from '~/backend/utils/dom';
import { store } from '~/backend/store/store';
import { OnboardingWizard } from './admin/pages/OnboardingWizard/OnboardingWizard';
import Calendar from '~/backend/admin/pages/Calendar/Calendar';
import Dashboard from '~/backend/admin/pages/Dashboard/Dashboard';
import Settings from '~/backend/admin/pages/Settings/Settings';

window.wpappointments.hooks = createHooks();

const pages = new Map<string, React.JSX.Element>();
pages.set('dashboard', <Dashboard />);
pages.set('calendar', <Calendar />);
pages.set('settings', <Settings />);
pages.set('wizard', <OnboardingWizard />);

register(store);
render(pages);
