import { Button } from '@wordpress/components';
import { apiFetch } from '@wpappointments/data';
import type { APIResponse } from '@wpappointments/data';
import cn from 'obj-str';
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
		try {
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
		} catch (error) {
			onError?.(error as T);
		}
	};
}
