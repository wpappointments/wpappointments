export type ApiResponse<T> = {
	status: string;
	message: string;
	data: T;
};
