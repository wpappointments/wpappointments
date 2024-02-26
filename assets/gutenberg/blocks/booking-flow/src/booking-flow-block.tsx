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
	icon: (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46.11 45.64">
			<g id="uuid-e0b9cb0c-757c-45ee-a7f7-c6e59225e73b" focusable="false">
				<path
					d="m32,9.64H4c-2.2,0-4,1.8-4,4v28c0,2.2,1.8,4,4,4h28c2.2,0,4-1.8,4-4V13.64c0-2.2-1.8-4-4-4Zm1,32c0,.6-.4,1-1,1H4c-.6,0-1-.4-1-1v-24h30v24ZM12,23.64h-4v4h4v-4Zm0,8h-4v4h4v-4Zm8,0h-4v4h4v-4Z"
					fill="#174aff"
				/>
				<circle cx="29" cy="17.11" r="17.11" fill="#fff" />
				<path
					d="m29,4.66c-6.86,0-12.44,5.58-12.44,12.44s5.58,12.44,12.44,12.44,12.44-5.58,12.44-12.44-5.58-12.44-12.44-12.44Zm0,19.37c-3.82,0-6.93-3.11-6.93-6.93s3.11-6.93,6.93-6.93,6.93,3.11,6.93,6.93-3.11,6.93-6.93,6.93Z"
					fill="#174aff"
				/>
				<rect
					x="26.42"
					y="14.13"
					width="6.94"
					height="4.4"
					transform="translate(-2.79 25.92) rotate(-45)"
					fill="#174aff"
				/>
				<rect x="24" y="31.64" width="4" height="4" fill="#174aff" />
			</g>
		</svg>
	),
});