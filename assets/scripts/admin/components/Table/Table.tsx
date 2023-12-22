import { Button } from '@wordpress/components';
import { Appointment } from '~/types';
import ActionButton from '~/admin/components/ActionButton/ActionButton';
import { empty, emptyIcon, table } from './Table.module.css';

type Props = {
	items?: Appointment[];
	onEmptyStateButtonClick?: () => void;
	dispatch: any;
};

export default function Table({
	items,
	onEmptyStateButtonClick,
	dispatch,
}: Props) {
	if (!items || items.length === 0) {
		return (
			<div className={empty}>
				<svg
					className={emptyIcon}
					viewBox="0 0 1024 1024"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M839.2 101.3H184.9L65.3 539.5 64 922.7h896V549.3l-120.8-448zM241.9 176h540.3L884 549.3H678.7l-74.7 112H420l-74.7-112H140.1L241.9 176z" />
				</svg>
				<p>You have no appointments yet</p>
				<Button variant="primary" onClick={onEmptyStateButtonClick}>
					Create New Appointment
				</Button>
			</div>
		);
	}

	return (
		<table className={table}>
			<thead>
				<tr>
					<th>Title</th>
					<th>Date</th>
					<th>Time</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{items.map(({ id, time, date, title, actions }) => (
					<tr key={id}>
						<td>{title}</td>
						<td>{date} </td>
						<td>{time}</td>
						<td>
							{Object.values(actions).map((action) => (
								<ActionButton
									key={action.name}
									action={action}
									onSuccess={(data: {
										id: number;
										message: string;
									}) => {
										console.log('success', data);
										dispatch.deleteAppointment(data.id);
									}}
									onError={(data: {
										id: number;
										message: string;
									}) => {
										console.log('error', data);
									}}
								/>
							))}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
