import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { HeaderActionsFill } from '@wpappointments/components';
import { useSlideout } from '@wpappointments/data';
import CustomerCreate from '~/backend/admin/components/CustomerCreate/CustomerCreate';
import CustomersTable from '~/backend/admin/components/CustomersTable/CustomersTable';
import { StateContextProvider } from '~/backend/admin/context/StateContext';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';

export default function Customers() {
	const { openSlideOut, isSlideoutOpen } = useSlideout();
	return (
		<StateContextProvider>
			<LayoutDefault title={__('Customers', 'appointments-booking')}>
				<HeaderActionsFill>
					<Button
						variant="primary"
						onClick={() => {
							openSlideOut({
								id: 'customer',
								data: {
									mode: 'create',
									screen: 'customers',
								},
							});
						}}
					>
						{__('Create New Customer', 'appointments-booking')}
					</Button>
				</HeaderActionsFill>
				<CustomersTable />
				{isSlideoutOpen('customer') && <CustomerCreate />}
			</LayoutDefault>
		</StateContextProvider>
	);
}
