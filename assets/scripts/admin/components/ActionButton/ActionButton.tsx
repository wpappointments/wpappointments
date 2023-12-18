import { Button } from '@wordpress/components';
import { actionButton, dangerousActionButton } from './ActionButton.module.css';
import cn from '~/utils/cn';
import apiFetch, { APIResponse } from '~/utils/fetch';

type Action = {
	name: string;
	label: string;
	method: string;
	uri: string;
	isDangerous: boolean;
};

type Props<T> = {
	action: Action;
	onSuccess?: (response: T) => void;
	onError?: (response: T) => void;
};

export default function ActionButton<T>({
	action,
	onSuccess,
	onError,
}: Props<T>) {
	const { label, isDangerous } = action;

	return (
		<Button
			variant="tertiary"
			size="small"
			className={cn({
				[actionButton]: true,
				[dangerousActionButton]: isDangerous,
			})}
			onClick={handleAction<T>(action, onSuccess, onError)}
			key={action.name}
		>
			{label}
		</Button>
	);
}

function handleAction<T>(
	action: Action,
	onSuccess?: (response: T) => void,
	onError?: (response: T) => void
) {
	const { uri, method } = action;

	return async () => {
		const response = await apiFetch<APIResponse<T>>({
			url: uri,
			method,
		});

		const { data } = response;

		if (onSuccess && response.type === 'success') {
			onSuccess(data);
		}

		if (onError && response.type === 'error') {
			onError(data);
		}
	};
}
