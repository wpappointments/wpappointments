import { ReactNode } from 'react';
import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import AppointmentsSettings from './Appointments/Appointments';
import GeneralSettings from './General/General';
import NotificationsSettings from './Notifications/Notifications';
import ScheduleSettings from './Schedule/Schedule';
import styles from './Settings.module.css';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';

type Tab = {
	name: string;
	title: string;
	className: string;
	component: ReactNode;
};

const tabs = new Map<string, Tab>([
	[
		'general',
		{
			name: 'general',
			title: __('General settings', 'wpappointments'),
			className: 'tab-general',
			component: <GeneralSettings />,
		},
	],
	[
		'appointments',
		{
			name: 'appointments',
			title: __('Appointments', 'wpappointments'),
			className: 'tab-appointments',
			component: <AppointmentsSettings />,
		},
	],
	[
		'schedule',
		{
			name: 'schedule',
			title: __('Schedule', 'wpappointments'),
			className: 'tab-schedule',
			component: <ScheduleSettings />,
		},
	],
	[
		'notifications',
		{
			name: 'notifications',
			title: __('Notifications', 'wpappointments'),
			className: 'tab-notifications',
			component: <NotificationsSettings />,
		},
	],
]);

export default function Settings() {
	return (
		<LayoutDefault title={__('Settings', 'wpappointments')}>
			<TabPanel
				className={styles.tabsContainer}
				activeClass="active-tab"
				initialTabName={window.location.hash.replace('#', '')}
				tabs={[...tabs.values()]}
				onSelect={(e) => {
					window.location.hash = `#${e}`;
				}}
			>
				{(tab) => tabs.get(tab.name)?.component}
			</TabPanel>
		</LayoutDefault>
	);
}
