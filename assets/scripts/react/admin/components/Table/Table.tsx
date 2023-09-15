import { Appointment } from '../../../../types';
import ActionButton from '../ActionButton/ActionButton';

type Props = {
	items: Appointment[];
	dispatch: any;
};

export default function Table( { items, dispatch }: Props ) {
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
				{ items.map( ( { id, time, date, title, actions } ) => (
					<tr key={ id }>
						<td>{ title }</td>
						<td>{ date } </td>
						<td>{ time }</td>
						<td>
							{ Object.values( actions ).map( ( action ) => (
								<ActionButton
									key={ action.name }
									action={ action }
									onSuccess={ ( data: {
										id: number;
										message: string;
									} ) => {
										console.log( 'success', data );
										dispatch.deleteAppointment( data.id );
									} }
									onError={ ( data: {
										id: number;
										message: string;
									} ) => {
										console.log( 'error', data );
									} }
								/>
							) ) }
						</td>
					</tr>
				) ) }
			</tbody>
		</table>
	);
}
