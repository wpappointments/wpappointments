import { Button, Card, CardHeader } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Text } from '~/backend/utils/experimental';
import useSlideout from '~/backend/hooks/useSlideout';
import CardBody from '~/backend/admin/components/CardBody/CardBody';
import CustomerCreate from '~/backend/admin/components/CustomerCreate/CustomerCreate';
import CustomersTable from '~/backend/admin/components/CustomersTable/CustomersTable';
import { StateContextProvider } from '~/backend/admin/context/StateContext';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';
import globalStyles from 'global.module.css';

export default function Customers() {
	const {openSlideOut, isSlideoutOpen} = useSlideout();
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
						<CustomersTable />
					</CardBody>
				</Card>
				{isSlideoutOpen('customer') && (
					<CustomerCreate/>
				)}
			</LayoutDefault>
		</StateContextProvider>
	);
}
