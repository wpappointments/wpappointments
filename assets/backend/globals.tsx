import { createHooks } from '@wordpress/hooks';
import * as privateApis from 'wpappointments-private-apis';
import { appointmentsApi } from './api/appointments';

window.wpappointments.hooks = createHooks();
window.wp.privateApis = privateApis;
appointmentsApi({});
