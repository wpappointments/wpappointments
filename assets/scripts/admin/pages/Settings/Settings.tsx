import { ReactNode } from 'react';
import { TabPanel } from '@wordpress/components';
import GeneralSettings from './General/General';
import ScheduleSettings from './Schedule/Schedule';
import LayoutDefault from '~/admin/layouts/LayoutDefault/LayoutDefault';
import { tabsConainer } from './Settings.module.css';

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
				className={tabsConainer}
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
