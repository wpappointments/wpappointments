import { Button, Card, CardHeader } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Text } from '~/backend/utils/experimental';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import CardBody from '~/backend/admin/components/CardBody/CardBody';
import Table from '~/backend/admin/components/CustomersTableFull/CustomersTableFull';
import {
	StateContextProvider,
	useStateContext,
} from '~/backend/admin/context/StateContext';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';
import globalStyles from 'global.module.css';

export default function Customers() {
	const { openSlideOut } = useSlideout();

	return (
		<StateContextProvider>
			<LayoutDefault title="Customers">
				<Card className={globalStyles.card}>
					<CardHeader>
						<Text size="title">
							{__('All Customers', 'wpappointments')}
						</Text>
						<Button
							variant="primary"
							onClick={() => {
								openSlideOut({
									id: 'customer',
									data: {
										mode: 'create',
									},
								});
							}}
						>
							{__('Create New Customer', 'wpappointments')}
						</Button>
					</CardHeader>
					<CardBody>
						<DashboardCustomers />
					</CardBody>
				</Card>
			</LayoutDefault>
		</StateContextProvider>
	);
}

function DashboardCustomers() {
	const { getSelector } = useStateContext();

	const customers = useSelect(() => {
		return select(store).getAllCustomers();
	}, [getSelector('getAllCustomers')]);

	return (
		<Table
			items={customers}
			hideHeader
			emptyStateMessage={__(
				'You have no customers yet',
				'wpappointments'
			)}
		/>
	);
}
