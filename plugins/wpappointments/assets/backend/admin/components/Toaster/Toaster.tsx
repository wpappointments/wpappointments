import { useEffect, useState } from 'react';
import { Snackbar } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import cn from '~/backend/utils/cn';
import { Toast } from '~/backend/store/notices/notices.types';
import { store } from '~/backend/store/store';
import styles from './Toaster.module.css';

export default function Toaster() {
	const toasts = useSelect((select) => {
		return select(store).getToasts();
	}, []);

	return (
		<div className={styles.toastContainer} id="toast-container">
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
				[styles.toastMessage]: true,
				[styles.isActive]: loaded,
				[styles.typeError]: toast.type === 'error',
				[styles.typeSuccess]: toast.type === 'success',
			})}
		>
			<Snackbar key={toast.id}>{toast.message}</Snackbar>
		</div>
	);
}
