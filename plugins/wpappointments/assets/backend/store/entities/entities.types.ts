import { Entity } from '~/backend/types';

export type EntitiesState = {
	entities: Entity[];
	totalItems: number;
	totalPages: number;
	postsPerPage: number;
	currentPage: number;
};
