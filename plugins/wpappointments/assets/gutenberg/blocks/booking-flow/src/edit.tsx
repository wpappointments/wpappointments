import { DetailedHTMLProps, HTMLAttributes, useState } from 'react';
import {
	InnerBlocks,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import {
	Button,
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
import { ButtonGroup } from '@wpappointments/components';
import { applyFilters } from '~/backend/utils/hooks';
import type { BookingFlowBlockAttributes } from './booking-flow-block';
import BookingFlow from '~/frontend/frontend';
import { Fill } from '~/frontend/slotfill';

const BUTTONS_TEMPLATE: ReadonlyArray<any> = [
	[
		'core/buttons',
		{ layout: { type: 'flex', justifyContent: 'right' } },
		[
			[
				'core/button',
				{
					text: __('Back', 'wpappointments'),
					className: 'wpa-back-button',
					style: { color: { text: '#333' } },
					backgroundColor: undefined,
				},
			],
			[
				'core/button',
				{
					text: __('Book', 'wpappointments'),
					className: 'wpa-submit-button',
				},
			],
		],
	],
];

export default function Edit({
	attributes,
	setAttributes,
}: BlockEditProps<BookingFlowBlockAttributes>) {
	const { alignment, width, flowType } = attributes;
	const isMultiStep = flowType === 'MultiStep';
	const [editorStep, setEditorStep] = useState(0);

	return (
		<div
			{...(useBlockProps({
				style:
					width === 'Full'
						? { maxWidth: 'none', width: '100%' }
						: undefined,
			}) as DetailedHTMLProps<
				HTMLAttributes<HTMLDivElement>,
				HTMLDivElement
			>)}
		>
			<BookingFlow
				attributes={attributes}
				editorStep={editorStep}
				isEditor
			>
				<Fill name="booking-flow/actions">
					<InnerBlocks
						template={BUTTONS_TEMPLATE}
						templateLock="all"
					/>
				</Fill>
			</BookingFlow>
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
						<ToggleControl
							label={__('Hide step titles', 'wpappointments')}
							help={__(
								'Hide all section headings from the booking flow',
								'wpappointments'
							)}
							checked={attributes.hideStepTitles}
							onChange={(hideStepTitles) =>
								setAttributes({ hideStepTitles })
							}
						/>
						{isMultiStep && (
							<>
								<SelectControl
									label={__('Preview step', 'wpappointments')}
									value={String(editorStep)}
									options={[
										{
											label: __(
												'1. Select date',
												'wpappointments'
											),
											value: '0',
										},
										{
											label: __(
												'2. Customer info',
												'wpappointments'
											),
											value: '1',
										},
									]}
									onChange={(v) => setEditorStep(Number(v))}
								/>
								<ToggleControl
									label={__(
										'Hide progress bar',
										'wpappointments'
									)}
									help={__(
										'Hide the step indicator at the top of the booking flow',
										'wpappointments'
									)}
									checked={attributes.hideProgressBar}
									onChange={(hideProgressBar) =>
										setAttributes({ hideProgressBar })
									}
								/>
							</>
						)}
					</PanelBody>
					{(!isMultiStep || editorStep === 0) && (
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
							{!attributes.inlineTimePicker && (
								<ToggleControl
									label={__(
										'Display available time slots as buttons',
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
							)}
							<ToggleControl
								label={__(
									'Inline time picker',
									'wpappointments'
								)}
								help={__(
									'Display the calendar and time slots side by side instead of stacked vertically',
									'wpappointments'
								)}
								checked={attributes.inlineTimePicker}
								onChange={(inlineTimePicker) =>
									setAttributes({ inlineTimePicker })
								}
							/>
						</PanelBody>
					)}
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
				{applyFilters<React.JSX.Element | null>(
					'wpappointments.bookingFlow.inspectorControls',
					null,
					attributes,
					setAttributes
				)}
			</InspectorControls>
		</div>
	);
}
