export type Error = {
	type: 'error';
	message: string;
	data: unknown[];
};

export function getErrorMessage(error: Error) {
	return error.message;
}

export function getErrorData(error: Error) {
	return error.data;
}
