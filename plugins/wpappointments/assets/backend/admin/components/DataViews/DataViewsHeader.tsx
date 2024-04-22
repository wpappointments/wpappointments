import { __ } from '@wordpress/i18n';
import type { Field } from './types';

export default function DataViewsHeader({ fields }: { fields: Field[] }) {
	return (
		<thead>
			<tr>
				{fields.map((field) => (
					<th key={field.id}>{field.header}</th>
				))}
				<th>{__('Actions', 'wpappointments')}</th>
			</tr>
		</thead>
	);
}
