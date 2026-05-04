export type NoticesState = {
	toasts: Toast[];
};

export type Toast = {
	id: string;
	message: string;
	type: 'success' | 'error';
	actions?: ToastAction[];
};

export type ToastAction = {
	label: string;
	url?: string;
	onClick?: () => void;
};
