import type { ReactNode } from 'react';
import type { IconProps } from '@wordpress/icons/build-types/icon';

export type CollectionItem = Record<string, unknown> & {
	id?: string | number;
};

export type View = {
	type: 'table';
	layout: object;
	hiddenFields: string[];
	perPage: number;
	page: number;
	options?: unknown[];
};

export type Field = {
	id: string;
	header: string;
	render: (args: { item: CollectionItem }) => ReactNode;
	enableSorting?: boolean;
	enableHiding?: boolean;
};

export type Action = {
	id: string;
	label: string;
	callback: (item: CollectionItem) => void;
	isEligible?: (item: CollectionItem) => boolean;
	isPrimary?: boolean;
	isDestructive?: boolean;
	icon?: IconProps['icon'];
};

export type PaginationInfo = {
	totalItems: number;
	totalPages: number;
};
