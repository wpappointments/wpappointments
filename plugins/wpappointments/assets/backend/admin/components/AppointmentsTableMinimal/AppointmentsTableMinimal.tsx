import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { fromUnixTime } from 'date-fns';
import cn from '~/backend/utils/cn';
import { userSiteTimezoneMatch } from '~/backend/utils/datetime';
import { formatDateRelative } from '~/backend/utils/i18n';
import { Appointment } from '~/backend/types';
import styles from './AppointmentsTableMinimal.module.css';

type Props = {
	items?: Appointment[];
	onView?: (appointment: Appointment) => void;
	emptyStateMessage?: string;
};

export default function AppointmentsTableMinimal({
	items,
	onView,
	emptyStateMessage,
}: Props) {
	if (!items || items.length === 0) {
		return (
			<div className={styles.empty}>
				<div>
					<svg
						className={styles.emptyIcon}
						viewBox="0 0 1024 1024"
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M839.2 101.3H184.9L65.3 539.5 64 922.7h896V549.3l-120.8-448zM241.9 176h540.3L884 549.3H678.7l-74.7 112H420l-74.7-112H140.1L241.9 176z" />
					</svg>
					<p>
						{emptyStateMessage ||
							__(
								'You have no appointments yet',
								'wpappointments'
							)}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.wrapper}>
			<table className={styles.table}>
				<tbody>
					{items.map((row) => (
						<TableRow key={row.id} row={row} view={onView} />
					))}
				</tbody>
			</table>
		</div>
	);
}

type TableRowProps = {
	row: Appointment;
	view?: (appointment: Appointment) => void;
};

function TableRow({ row, view }: TableRowProps) {
	const { id, service, timestamp, duration } = row;
	const dateStart = fromUnixTime(timestamp);
	const userDiffTimezone = userSiteTimezoneMatch();

	return (
		<tr key={id}>
			<td width={16} style={{ paddingLeft: 8, paddingRight: 8 }}>
				{row.status === 'pending' && (
					<span
						className={cn({
							[styles.status]: true,
							[styles.pending]: true,
						})}
						title={__('Pending', 'wpappointments')}
					></span>
				)}
				{row.status === 'confirmed' && (
					<span
						className={cn({
							[styles.status]: true,
							[styles.confirmed]: true,
						})}
						title={__('Confirmed', 'wpappointments')}
					></span>
				)}
			</td>
			<td>
				<Button
					variant="link"
					onClick={() => {
						view && view(row);
					}}
					style={{ marginBottom: '5px' }}
				>
					<strong>{service}</strong>
				</Button>
				{' — '}
				{row.customer.name}
			</td>
			<td>
				{formatDateRelative(dateStart, new Date())}
				{userDiffTimezone && ` (${userDiffTimezone})`}
			</td>
			<td>{duration} min</td>
		</tr>
	);
}
