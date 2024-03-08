import { Button, Card, CardHeader } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Text } from '~/backend/utils/experimental';
import useSlideout from '~/backend/hooks/useSlideout';
import CardBody from '~/backend/admin/components/CardBody/CardBody';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';
import globalStyles from 'global.module.css';

export default function Customers() {
	const { openSlideOut, isSlideoutOpen } = useSlideout();

	return (
		<LayoutDefault title="Settings">
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
					
				</CardBody>
			</Card>
		</LayoutDefault>
	);
}