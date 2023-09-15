import { Button } from '@wordpress/components';
import cn from '../../../utils/cn';
import apiFetch, { APIResponse } from '../../../utils/fetch';

type Action = {
	name: string;
	label: string;
	method: string;
	uri: string;
	isDangerous: boolean;
};

type Props< T > = {
	action: Action;
	onSuccess?: ( response: T ) => void;
	onError?: ( response: T ) => void;
};

export default function ActionButton< T >( {
	action,
	onSuccess,
	onError,
}: Props< T > ) {
	const { label, isDangerous } = action;

	return (
		<Button
			variant="tertiary"
			size="small"
			className={ cn( {
				'wpappointments-table__action': true,
				'wpappointments-table__action--dangerous': isDangerous,
			} ) }
			onClick={ handleAction< T >( action, onSuccess, onError ) }
			key={ action.name }
		>
			{ label }
		</Button>
	);
}

function handleAction< T >(
	action: Action,
	onSuccess?: ( response: T ) => void,
	onError?: ( response: T ) => void
) {
	const { uri, method } = action;

	return async () => {
		const response = await apiFetch< APIResponse< T > >( {
			url: uri,
			method: method,
		} );

		const { data } = response;

		if ( response.type === 'success' ) {
			onSuccess?.( data );
		}

		if ( response.type === 'error' ) {
			onError?.( data );
		}
	};
}
