import type { Error as AppError } from './error';

export default async function resolve<T>(
	callback: () => Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<[AppError | null, T | null]> {
	try {
		const response = await callback();
		return [null, response];
	} catch (error) {
		return [
			{
				type: 'error',
				message:
					error instanceof globalThis.Error
						? error.message
						: String(error),
				data: error,
			} as AppError,
			null,
		];
	}
}
