import { createHooks } from '@wordpress/hooks';
import { appointmentsApi } from './api/appointments';

window.wpappointments.hooks = createHooks();
appointmentsApi();
