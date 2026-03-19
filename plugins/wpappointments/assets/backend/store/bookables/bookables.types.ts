import { BookableEntity, BookableType } from '~/backend/types';

export type BookablesState = {
	bookables: BookableEntity[];
	types: BookableType[];
	totalItems: number;
	totalPages: number;
	postsPerPage: number;
	currentPage: number;
};
