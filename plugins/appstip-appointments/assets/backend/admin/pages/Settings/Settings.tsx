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
		title: __('General', 'appstip-appointments'),
		component: <GeneralSettings />,
	},
	{
		name: 'appointments',
		title: __('Appointments', 'appstip-appointments'),
		component: <AppointmentsSettings />,
	},
	{
		name: 'schedule',
		title: __('Schedule', 'appstip-appointments'),
		component: <ScheduleSettings />,
	},
	{
		name: 'days-off',
		title: __('Days Off', 'appstip-appointments'),
		component: <DaysOffSettings />,
	},
	{
		name: 'notifications',
		title: __('Notifications', 'appstip-appointments'),
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
		<LayoutDefault title={__('Settings', 'appstip-appointments')} fullWidth>
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
