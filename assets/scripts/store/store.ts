import { combineReducers, createReduxStore, register } from '@wordpress/data';
import { SettingsState } from './settings/settings.types';
import { AppointmentsState } from './appointments/appointments.types';
import actions from './actions';
import selectors from './selectors';
import controls from './controls';
import reducers from './reducers';
import resolvers from './resolvers';

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

register(store);
