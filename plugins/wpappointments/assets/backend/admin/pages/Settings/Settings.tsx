import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import cn from 'obj-str';
import AppointmentsSettings from './Appointments/Appointments';
import DaysOffSettings from './DaysOff/DaysOff';
import GeneralSettings from './General/General';
import NotificationsSettings from './Notifications/Notifications';
import ScheduleSettings from './Schedule/Schedule';
import styles from './Settings.module.css';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';

type Tab = {
	name: string;
	title: string;
	component: React.ReactNode;
};

const tabs: Tab[] = [
	{
		name: 'general',
		title: __('General', 'appointments-booking'),
		component: <GeneralSettings />,
	},
	{
		name: 'appointments',
		title: __('Appointments', 'appointments-booking'),
		component: <AppointmentsSettings />,
	},
	{
		name: 'schedule',
		title: __('Schedule', 'appointments-booking'),
		component: <ScheduleSettings />,
	},
	{
		name: 'days-off',
		title: __('Days Off', 'appointments-booking'),
		component: <DaysOffSettings />,
	},
	{
		name: 'notifications',
		title: __('Notifications', 'appointments-booking'),
		component: <NotificationsSettings />,
	},
];

function getInitialTab(): string {
	const hash = window.location.hash.replace('#', '');
	const valid = tabs.some((tab) => tab.name === hash);
	return valid ? hash : 'general';
}

export default function Settings() {
	const [activeTab, setActiveTab] = useState(getInitialTab);

	function selectTab(name: string) {
		setActiveTab(name);
		window.location.hash = `#${name}`;
	}

	const activeComponent = tabs.find(
		(tab) => tab.name === activeTab
	)?.component;

	return (
		<LayoutDefault title={__('Settings', 'appointments-booking')} fullWidth>
			<div className={styles.container}>
				<nav className={styles.sidebar}>
					<ul className={styles.menu}>
						{tabs.map((tab) => (
							<li key={tab.name}>
								<button
									className={cn({
										[styles.menuItem]: true,
										[styles.active]: activeTab === tab.name,
									})}
									onClick={() => selectTab(tab.name)}
									type="button"
								>
									{tab.title}
								</button>
							</li>
						))}
					</ul>
				</nav>
				<div className={styles.content}>{activeComponent}</div>
			</div>
		</LayoutDefault>
	);
}
