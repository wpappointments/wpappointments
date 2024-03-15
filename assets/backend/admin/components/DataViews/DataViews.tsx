import { DropdownMenu } from '@wordpress/components';
import {
	more,
	arrowLeft,
	arrowRight,
	arrowUp,
	arrowDown,
} from '@wordpress/icons';

export function DataViews() {
	const MyDropdown = () => (
		<DropdownMenu
			icon={more}
			label={__('More', 'wpappointments')}
			controls={[
				{
					title: 'Up',
					icon: arrowUp,
					onClick: () => console.log('up'),
				},
				{
					title: 'Right',
					icon: arrowRight,
					onClick: () => console.log('right'),
				},
				{
					title: 'Down',
					icon: arrowDown,
					onClick: () => console.log('down'),
				},
				{
					title: 'Left',
					icon: arrowLeft,
					onClick: () => console.log('left'),
				},
			]}
		/>
	);
	return (
		<>
			<MyDropdown />
		</>
	);
}
