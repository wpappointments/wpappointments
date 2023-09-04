import { Button } from '@wordpress/components';
import cn from '../../../utils/cn';

type Action = {
	name: string;
	label: string;
	method: string;
	uri: string;
	isDangerous: boolean;
};

type Props = {
	action: Action;
};

export default function ActionButton( { action }: Props ) {
	const { label, isDangerous } = action;

	return (
		<Button
			variant="tertiary"
			size="small"
			className={ cn( {
				'wpappointments-table__action': true,
				'wpappointments-table__action--dangerous': isDangerous,
			} ) }
			onClick={ handleAction( action ) }
			key={ action.name }
		>
			{ label }
		</Button>
	);
}

function handleAction( action: Action ) {
	const { uri, method } = action;

	return async () => {
		const response = await fetch( uri, {
			method: method,
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': window.wpappointments.api.nonce,
			},
		} );

		const { data: responseData } = await response.json();

		console.log( responseData );
	};
}
