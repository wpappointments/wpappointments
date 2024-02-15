import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';

export type EditorFile = {
	name: string;
	contents: string;
};

export type Attributes = {
	test: string;
};

// @ts-ignore
registerBlockType<Attributes>(metadata.name, {
	edit: Edit,
});
