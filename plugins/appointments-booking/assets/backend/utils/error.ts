export type Error = {
	type: 'error';
	message: string;
	data: unknown[];
};

export function getErrorMessage(error: Error) {
	return error.message;
}
