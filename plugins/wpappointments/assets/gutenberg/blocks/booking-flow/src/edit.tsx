import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import {
	Button,
	ButtonGroup,
	Panel,
	PanelBody,
	SelectControl,
	ToggleControl,
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
					<PanelBody title={__('General', 'wpappointments')}>
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
					<PanelBody title={__('Calendar', 'wpappointments')}>
						<ToggleControl
							label={__(
								'Trim time slots outside of working hours',
								'wpappointments'
							)}
							help={__(
								'When showing the time picker, hide time slots that are not available for booking before and after opening hours',
								'wpappointments'
							)}
							checked={attributes.trimUnavailable}
							onChange={(trimUnavailable) =>
								setAttributes({ trimUnavailable })
							}
						/>
						<ToggleControl
							label={__(
								'Display avaialble time slots as buttons',
								'wpappointments'
							)}
							help={__(
								'Shows the available time slots as buttons. Recommended if you have a lot of traffic from mobile devices',
								'wpappointments'
							)}
							checked={attributes.slotsAsButtons}
							onChange={(slotsAsButtons) =>
								setAttributes({ slotsAsButtons })
							}
						/>
					</PanelBody>
					<PanelBody title={__('Alignment', 'wpappointments')}>
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
					<PanelBody title={__('Size', 'wpappointments')}>
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
