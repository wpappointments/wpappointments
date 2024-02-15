import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import type { Attributes } from './booking-flow-block';

export default function Edit({ attributes }: BlockEditProps<Attributes>) {
	return (
		<div
			{...(useBlockProps() as DetailedHTMLProps<
				HTMLAttributes<HTMLDivElement>,
				HTMLDivElement
			>)}
		>
			<p>Booking Flow</p>
		</div>
	);
}
