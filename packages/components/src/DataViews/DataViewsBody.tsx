import { Button } from '@wordpress/components';
import type { Field, Action, CollectionItem } from './types';

type DataViewBodyProps = {
	fields: Field[];
	data: CollectionItem[];
	actions: Action[];
};

export default function DataViewsBody({
	fields,
	data,
	actions,
}: DataViewBodyProps) {
	return (
		<tbody>
			{data.map((item, index) => (
				<tr key={(item as { id?: number }).id ?? index}>
					{fields.map((field) => (
						<td key={field.id}>{field.render({ item })}</td>
					))}
					<td>
						{actions.map((action) =>
							action.isEligible === undefined ||
							action.isEligible(item) ? (
								<Button
									label={action.label}
									icon={action.icon}
									isDestructive={action.isDestructive}
									size="compact"
									onClick={() => action.callback(item)}
									key={action.id}
								/>
							) : null
						)}
					</td>
				</tr>
			))}
		</tbody>
	);
}
