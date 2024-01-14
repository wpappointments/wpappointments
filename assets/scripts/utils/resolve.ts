import { Error } from './error';

export default async function resolve<T>(
	callback: () => Promise<any>
): Promise<[Error | null, T | null]> {
	try {
		const response = await callback();
		return [null, response];
	} catch (error) {
		return [error, null];
	}
}
