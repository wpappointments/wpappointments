import { __ } from '@wordpress/i18n';
import { missingId } from '~/backend/utils/api';
import { Error, getErrorMessage } from '~/backend/utils/error';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { displayErrorToast, displaySuccessToast } from '~/backend/utils/toast';
import { Entity } from '~/backend/types';

export type CreateEntityData = Pick<
	Entity,
	| 'name'
	| 'parentId'
	| 'active'
	| 'description'
	| 'type'
	| 'capacity'
	| 'image'
	| 'scheduleId'
	| 'scheduleMode'
	| 'bufferBefore'
	| 'bufferAfter'
	| 'minLeadTime'
	| 'maxLeadTime'
	| 'sortOrder'
>;

export type UpdateEntityData = CreateEntityData & {
	id: number;
};

type EntityResponse = APIResponse<{
	entity: Entity;
	message: string;
}>;

type EntitiesResponse = APIResponse<{
	entities: Entity[];
	total: number;
}>;

type TreeResponse = APIResponse<{
	tree: Entity[];
}>;

type DeleteResponse = APIResponse<{
	entityId: number;
}>;

type EntityServicesResponse = APIResponse<{
	serviceIds: number[];
}>;

export type EntitiesApiOptions = {
	invalidateCache?: (selector: string) => void;
};

export function entitiesApi(options?: EntitiesApiOptions) {
	const apiPath = 'entities';
	const { invalidateCache } = options || {};

	async function getEntities(params?: {
		active?: boolean;
		parent_id?: number;
		type?: string;
		paged?: number;
		number?: number;
	}) {
		const query = new URLSearchParams();

		if (params?.active !== undefined) {
			query.set('active', String(params.active));
		}
		if (params?.parent_id !== undefined) {
			query.set('parent_id', String(params.parent_id));
		}
		if (params?.type !== undefined) {
			query.set('type', params.type);
		}
		if (params?.paged !== undefined) {
			query.set('paged', String(params.paged));
		}
		if (params?.number !== undefined) {
			query.set('number', String(params.number));
		}

		const queryString = query.toString();
		const path = queryString ? `${apiPath}?${queryString}` : apiPath;

		const [error, response] = await resolve<EntitiesResponse>(async () => {
			return await apiFetch<EntitiesResponse>({ path });
		});

		if (error) {
			handleError(error, 'Error fetching entities');
			return null;
		}

		return response;
	}

	async function getEntitiesTree(parentId?: number) {
		const query = parentId ? `?parent_id=${parentId}` : '';

		const [error, response] = await resolve<TreeResponse>(async () => {
			return await apiFetch<TreeResponse>({
				path: `${apiPath}/tree${query}`,
			});
		});

		if (error) {
			handleError(error, 'Error fetching entity tree');
			return null;
		}

		return response;
	}

	async function getEntity(id: number) {
		if (missingId(id, 'Cannot fetch entity')) {
			return null;
		}

		const [error, response] = await resolve<EntityResponse>(async () => {
			return await apiFetch<EntityResponse>({
				path: `${apiPath}/${id}`,
			});
		});

		if (error) {
			handleError(error, 'Error fetching entity');
			return null;
		}

		return response;
	}

	async function createEntity(data: CreateEntityData) {
		const [error, response] = await resolve<EntityResponse>(async () => {
			return await apiFetch<EntityResponse>({
				path: apiPath,
				method: 'POST',
				data: {
					name: data.name,
					parent_id: data.parentId ?? 0,
					active: data.active ?? true,
					description: data.description ?? '',
					type: data.type ?? '',
					capacity: data.capacity ?? 1,
					image: data.image ?? '',
					schedule_id: data.scheduleId ?? 0,
					schedule_mode: data.scheduleMode ?? 'inherit',
					buffer_before: data.bufferBefore ?? 0,
					buffer_after: data.bufferAfter ?? 0,
					min_lead_time: data.minLeadTime ?? 0,
					max_lead_time: data.maxLeadTime ?? 0,
					sort_order: data.sortOrder ?? 0,
				},
			});
		});

		if (error) {
			handleError(error, 'Error creating entity');
			return null;
		}

		if (response && response.status === 'success') {
			displaySuccessToast(
				__('Entity created successfully', 'wpappointments')
			);

			if (invalidateCache) {
				invalidateCache('getEntities');
			}
		}

		return response;
	}

	async function updateEntity(data: UpdateEntityData) {
		const [error, response] = await resolve<EntityResponse>(async () => {
			return await apiFetch<EntityResponse>({
				path: `${apiPath}/${data.id}`,
				method: 'POST',
				data: {
					name: data.name,
					parent_id: data.parentId,
					active: data.active,
					description: data.description,
					type: data.type,
					capacity: data.capacity,
					image: data.image,
					schedule_id: data.scheduleId,
					schedule_mode: data.scheduleMode,
					buffer_before: data.bufferBefore,
					buffer_after: data.bufferAfter,
					min_lead_time: data.minLeadTime,
					max_lead_time: data.maxLeadTime,
					sort_order: data.sortOrder,
				},
			});
		});

		if (error) {
			handleError(error, 'Error updating entity');
			return null;
		}

		if (response && response.status === 'success') {
			displaySuccessToast(
				__('Entity updated successfully', 'wpappointments')
			);

			if (invalidateCache) {
				invalidateCache('getEntities');
			}
		}

		return response;
	}

	async function deleteEntity(id: number, reassignChildren: boolean = true) {
		if (missingId(id, 'Cannot delete entity')) {
			return null;
		}

		const [error, response] = await resolve<DeleteResponse>(async () => {
			return await apiFetch<DeleteResponse>({
				path: `${apiPath}/${id}?reassign_children=${reassignChildren}`,
				method: 'DELETE',
			});
		});

		if (error) {
			handleError(error, __('Cannot delete entity', 'wpappointments'));
			return null;
		}

		if (response) {
			displaySuccessToast(
				__('Entity deleted successfully', 'wpappointments')
			);

			if (invalidateCache) {
				invalidateCache('getEntities');
			}
		}

		return response;
	}

	async function updateEntityServices(
		entityId: number,
		serviceIds: number[]
	) {
		const [error, response] = await resolve<EntityServicesResponse>(
			async () => {
				return await apiFetch<EntityServicesResponse>({
					path: `${apiPath}/${entityId}/services`,
					method: 'POST',
					data: { service_ids: serviceIds },
				});
			}
		);

		if (error) {
			handleError(error, 'Error updating entity services');
			return null;
		}

		if (response && response.status === 'success') {
			displaySuccessToast(
				__('Entity services updated successfully', 'wpappointments')
			);
		}

		return response;
	}

	function handleError(error: Error, message: string) {
		displayErrorToast(`${message}: ${getErrorMessage(error)}`);
		console.error('Error: ' + getErrorMessage(error));
	}

	const functions = {
		getEntities,
		getEntitiesTree,
		getEntity,
		createEntity,
		updateEntity,
		deleteEntity,
		updateEntityServices,
	} as const;

	window.wpappointments.api = {
		...window.wpappointments.api,
		...functions,
	};

	return functions;
}

export type EntitiesApi = ReturnType<typeof entitiesApi>;
