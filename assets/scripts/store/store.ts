import { combineReducers, createReduxStore } from '@wordpress/data';
import actions from './actions';
import { AppointmentsState } from './appointments/appointments.types';
import controls from './controls';
import reducers from './reducers';
import resolvers from './resolvers';
import selectors from './selectors';
import { SettingsState } from './settings/settings.types';

export type State = {
	appointments: AppointmentsState;
	settings: SettingsState;
};

export const store = createReduxStore('wpappointments', {
	reducer: combineReducers(reducers),
	selectors,
	resolvers,
	actions,
	controls,
});
