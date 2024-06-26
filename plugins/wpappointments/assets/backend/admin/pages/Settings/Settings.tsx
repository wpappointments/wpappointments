import { ReactNode } from 'react';
import { TabPanel } from '@wordpress/components';
import AppointmentsSettings from './Appointments/Appointments';
import GeneralSettings from './General/General';
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
			title: 'General settings',
			className: 'tab-general',
			component: <GeneralSettings />,
		},
	],
	[
		'appointments',
		{
			name: 'appointments',
			title: 'Appointments',
			className: 'tab-appointments',
			component: <AppointmentsSettings />,
		},
	],
	[
		'schedule',
		{
			name: 'schedule',
			title: 'Schedule',
			className: 'tab-schedule',
			component: <ScheduleSettings />,
		},
	],
]);

export default function Settings() {
	return (
		<LayoutDefault title="Settings">
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
