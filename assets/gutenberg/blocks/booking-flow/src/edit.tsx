import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import {
	Button,
	ButtonGroup,
	Panel,
	PanelBody,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	Icon,
	column,
	positionCenter,
	positionLeft,
	positionRight,
	stretchFullWidth,
} from '@wordpress/icons';
import type { BookingFlowBlockAttributes } from './booking-flow-block';
import BookingFlow from '~/frontend/frontend';

export default function Edit({
	attributes,
	setAttributes,
}: BlockEditProps<BookingFlowBlockAttributes>) {
	const { alignment, width } = attributes;

	return (
		<div
			{...(useBlockProps() as DetailedHTMLProps<
				HTMLAttributes<HTMLDivElement>,
				HTMLDivElement
			>)}
		>
			<BookingFlow attributes={attributes} />
			<InspectorControls>
				<Panel>
					<PanelBody title="General">
						<SelectControl
							label={__('Flow type', 'wpappointments')}
							value={attributes.flowType}
							options={[
								{ label: 'One step', value: 'OneStep' },
								{ label: 'Multi step', value: 'MultiStep' },
							]}
							onChange={(flowType: 'OneStep' | 'MultiStep') =>
								setAttributes({ flowType })
							}
						/>
					</PanelBody>
					<PanelBody title="Alignment">
						<ButtonGroup>
							<Button
								variant={
									alignment === 'Left'
										? 'primary'
										: 'secondary'
								}
								onClick={() =>
									setAttributes({ alignment: 'Left' })
								}
								icon={<Icon icon={positionLeft} />}
								label={__('Align left', 'wpappointments')}
							/>
							<Button
								variant={
									alignment === 'Center'
										? 'primary'
										: 'secondary'
								}
								onClick={() =>
									setAttributes({ alignment: 'Center' })
								}
								icon={<Icon icon={positionCenter} />}
								label={__('Align center', 'wpappointments')}
							/>
							<Button
								variant={
									alignment === 'Right'
										? 'primary'
										: 'secondary'
								}
								onClick={() =>
									setAttributes({ alignment: 'Right' })
								}
								icon={<Icon icon={positionRight} />}
								label={__('Align right', 'wpappointments')}
							/>
						</ButtonGroup>
					</PanelBody>
					<PanelBody title="Size">
						<ButtonGroup>
							<Button
								variant={
									width === 'Narrow' ? 'primary' : 'secondary'
								}
								onClick={() =>
									setAttributes({ width: 'Narrow' })
								}
								icon={<Icon icon={column} />}
								label={__('Size narrow', 'wpappointments')}
							/>
							<Button
								variant={
									width === 'Full' ? 'primary' : 'secondary'
								}
								onClick={() => setAttributes({ width: 'Full' })}
								icon={<Icon icon={stretchFullWidth} />}
								label={__('Size full width', 'wpappointments')}
							/>
						</ButtonGroup>
					</PanelBody>
				</Panel>
			</InspectorControls>
		</div>
	);
}
