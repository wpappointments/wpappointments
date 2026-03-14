import { Service } from '~/backend/types';

export type ServicesState = {
	services: Service[];
	totalItems: number;
	totalPages: number;
	postsPerPage: number;
	currentPage: number;
};
