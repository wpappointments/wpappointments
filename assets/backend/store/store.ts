import { combineReducers, createReduxStore } from '@wordpress/data';
import actions from './actions';
import { AppointmentsState } from './appointments/appointments.types';
import { AvailabilityState } from './availability/availability.types';
import controls from './controls';
import { NoticesState } from './notices/notices.types';
import reducers from './reducers';
import resolvers from './resolvers';
import selectors from './selectors';
import { SettingsState } from './settings/settings.types';
import { SlideoutState } from './slideout/slideout.types';

export type State = {
	appointments: AppointmentsState;
	settings: SettingsState;
	slideouts: SlideoutState;
	notices: NoticesState;
	availability: AvailabilityState;
};

export const store = createReduxStore('wpappointments', {
	reducer: combineReducers(reducers),
	selectors,
	resolvers,
	actions,
	controls,
});
