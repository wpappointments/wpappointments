import { ReactNode } from 'react';
import { TabPanel } from '@wordpress/components';
import LayoutWithTabs from '../../layouts/LayoutWithTabs';
import GeneralSettings from './General/General';
import ScheduleSettings from './Schedule/Schedule';

type Tab = {
	name: string;
	title: string;
	className: string;
	component: ReactNode;
};

const tabs = new Map< string, Tab >( [
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
] );

export default function Settings() {
	return (
		<LayoutWithTabs title="Settings">
			<TabPanel
				className="wpappointments-tabs"
				activeClass="active-tab"
				initialTabName={ window.location.hash.replace( '#', '' ) }
				tabs={ [ ...tabs.values() ] }
				onSelect={ ( e ) => {
					window.location.hash = `#${ e }`;
				} }
			>
				{ ( tab ) => tabs.get( tab.name )?.component }
			</TabPanel>
		</LayoutWithTabs>
	);
}
