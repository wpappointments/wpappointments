import { combineReducers, createReduxStore } from '@wordpress/data';
import actions from './actions';
import { AppointmentsState } from './appointments/appointments.types';
import { AvailabilityState } from './availability/availability.types';
import { BookablesState } from './bookables/bookables.types';
import controls from './controls';
import { CustomersState } from './customers/customers.types';
import { EntitiesState } from './entities/entities.types';
import { NoticesState } from './notices/notices.types';
import reducers from './reducers';
import resolvers from './resolvers';
import selectors from './selectors';
import { ServicesState } from './services/services.types';
import { SettingsState } from './settings/settings.types';
import { AppointmentSlideoutState } from './slideout/appointment/appointment.types';
import { SlideoutState } from './slideout/slideout.types';

export type State = {
	appointments: AppointmentsState;
	settings: SettingsState;
	slideouts: SlideoutState;
	notices: NoticesState;
	availability: AvailabilityState;
	appointmentSlideout: AppointmentSlideoutState;
	customers: CustomersState;
	entities: EntitiesState;
	services: ServicesState;
	bookables: BookablesState;
};

export const store = createReduxStore('wpappointments', {
	reducer: combineReducers(reducers),
	selectors,
	resolvers,
	actions,
	controls,
});

export { actions, selectors, resolvers, controls };
