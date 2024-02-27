import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';

export type EditorFile = {
	name: string;
	contents: string;
};

export type BookingFlowBlockAttributes = {
	flowType: 'OneStep' | 'MultiStep';
	alignment: 'Left' | 'Center' | 'Right';
	width: 'Narrow' | 'Full';
};

// @ts-ignore
registerBlockType<BookingFlowBlockAttributes>(metadata.name, {
	edit: Edit,
	icon: (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41.45 40.98">
			<g id="uuid-956e23e8-926f-4a3f-8843-a18bcb8e45cc" focusable="false">
				<rect x="8" y="18.98" width="4" height="4" fill="#174aff" />
				<rect x="8" y="26.98" width="4" height="4" fill="#174aff" />
				<rect x="16" y="26.98" width="4" height="4" fill="#174aff" />
				<path
					d="m33,29.06v7.91c0,.6-.4,1-1,1H4c-.6,0-1-.4-1-1V12.98h8.92c0-.18-.03-.35-.03-.53,0-2.68.63-5.21,1.73-7.47H4C1.8,4.98,0,6.78,0,8.98v28c0,2.2,1.8,4,4,4h28c2.2,0,4-1.8,4-4v-8.93c-.96.43-1.96.77-3,1.02Z"
					fill="#174aff"
				/>
				<path
					d="m29,0c-6.86,0-12.44,5.58-12.44,12.44s5.58,12.44,12.44,12.44,12.44-5.58,12.44-12.44S35.86,0,29,0Zm0,19.37c-3.82,0-6.93-3.11-6.93-6.93s3.11-6.93,6.93-6.93,6.93,3.11,6.93,6.93-3.11,6.93-6.93,6.93Z"
					fill="#174aff"
				/>
				<rect
					x="26.42"
					y="9.46"
					width="6.94"
					height="4.4"
					transform="translate(.51 24.56) rotate(-45)"
					fill="#174aff"
				/>
				<rect x="24" y="26.98" width="4" height="4" fill="#174aff" />
			</g>
		</svg>
	),
});
