import { useEffect, useState } from 'react';
import { Snackbar } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import cn from '~/utils/cn';
import { Toast } from '~/store/notices/notices.types';
import { store } from '~/store/store';
import {
	isActive,
	toastContainer,
	toastMessage,
	typeError,
	typeSuccess,
} from './Toaster.module.css';

export default function Toaster() {
	const toasts = useSelect((select) => {
		return select(store).getToasts();
	}, []);

	return (
		<div className={toastContainer} id="toast-container">
			{toasts.map((toast) => {
				return <ToastMessage key={toast.id} toast={toast} />;
			})}
		</div>
	);
}

function ToastMessage({ toast }: { toast: Toast }) {
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		setLoaded(true);
	}, []);

	return (
		<div
			className={cn({
				[toastMessage]: true,
				[isActive]: loaded,
				[typeError]: toast.type === 'error',
				[typeSuccess]: toast.type === 'success',
			})}
		>
			<Snackbar key={toast.id}>{toast.message}</Snackbar>
		</div>
	);
}
