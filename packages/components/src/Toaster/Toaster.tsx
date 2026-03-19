import { useEffect, useState } from 'react';
import { Snackbar } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import cn from 'obj-str';
import styles from './Toaster.module.css';

const STORE_NAME = 'wpappointments';

type Toast = {
	id: string;
	message: string;
	type: 'success' | 'error';
};

export default function Toaster() {
	const toasts = useSelect(() => {
		return select(STORE_NAME).getToasts();
	}, []);

	return (
		<div className={styles.toastContainer} id="toast-container">
			{toasts.map((toast: Toast) => {
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
