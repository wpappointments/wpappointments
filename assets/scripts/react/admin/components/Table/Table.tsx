import { Button } from '@wordpress/components';

export default function Table() {
	return (
		<table className="wpappointments-table">
			<thead>
				<tr>
					<th>Time</th>
					<th>Client</th>
					<th>Status</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>10:00</td>
					<td>John Doe</td>
					<td>Completed</td>
					<td>
						<Button variant="secondary">Edit</Button>
					</td>
				</tr>
			</tbody>
		</table>
	);
}
