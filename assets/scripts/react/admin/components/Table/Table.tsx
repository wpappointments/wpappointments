import ActionButton from '../ActionButton/ActionButton';

type Action = {
	name: string;
	label: string;
	method: string;
	uri: string;
	isDangerous: boolean;
};

type Appointment = {
	id: number;
	title: string;
	date: string;
	time: string;
	actions: {
		[ key: string ]: Action;
	};
};

type Props = {
	items: Appointment[];
};

export default function Table( { items }: Props ) {
	return (
		<table className="wpappointments-table">
			<thead>
				<tr>
					<th>Title</th>
					<th>Date</th>
					<th>Time</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{ items.map( ( { time, date, title, actions } ) => (
					<tr key={ title }>
						<td>{ title }</td>
						<td>{ date } </td>
						<td>{ time }</td>
						<td>
							{ Object.values( actions ).map( ( action ) => (
								<ActionButton action={ action } />
							) ) }
						</td>
					</tr>
				) ) }
			</tbody>
		</table>
	);
}
