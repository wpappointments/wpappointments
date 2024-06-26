import { Button } from '@wordpress/components';
import cn from '~/backend/utils/cn';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import styles from './ActionButton.module.css';

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
	variant?: 'primary' | 'secondary' | 'tertiary' | 'link';
	isDestructive?: boolean;
};

export default function ActionButton<T>({
	action,
	onSuccess,
	onError,
	variant = 'tertiary',
	isDestructive = false,
}: Props<T>) {
	const { label, isDangerous } = action;

	return (
		<Button
			variant={variant}
			isDestructive={isDestructive}
			size="small"
			className={cn({
				[styles.actionButton]: true,
				[styles.dangerousActionButton]: isDangerous,
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

		if (onSuccess && response.status === 'success') {
			onSuccess(data);
		}

		if (onError && response.status === 'error') {
			onError(data);
		}
	};
}
