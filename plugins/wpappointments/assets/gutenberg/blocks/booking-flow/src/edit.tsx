import {
	DetailedHTMLProps,
	HTMLAttributes,
	Suspense,
	lazy,
	useEffect,
	useState,
} from 'react';
import {
	InnerBlocks,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import type { BlockEditProps, TemplateArray } from '@wordpress/blocks';
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
// Import directly to avoid pulling @wordpress/dataviews through the barrel.
// The barrel re-exports DataForm/DataViews which bundles @wordpress/dataviews
// and conflicts with core's copy on Full Site Editor pages.
import ButtonGroup from '@wpappointments/components/ButtonGroup';
import { applyFilters } from '~/backend/utils/hooks';
import type { BookingFlowBlockAttributes } from './booking-flow-block';
import { Fill } from '~/frontend/slotfill';

// Lazy-load BookingFlow so @wordpress/dataviews is in a separate chunk
// that only loads when the block is rendered, avoiding the private-apis
// conflict on FSE pages where the block isn't present.
const BookingFlow = lazy(() => import('~/frontend/frontend'));

const BUTTONS_TEMPLATE: TemplateArray = [
	[
		'core/buttons',
		{ layout: { type: 'flex', justifyContent: 'right' } },
		[
			[
				'core/button',
				{
					text: __('Back', 'appointments-booking'),
					className: 'wpa-back-button',
					style: { color: { text: '#333' } },
					backgroundColor: undefined,
				},
			],
			[
				'core/button',
				{
					text: __('Book', 'appointments-booking'),
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

	useEffect(() => {
		if (!isMultiStep) {
			setEditorStep(0);
		}
	}, [isMultiStep]);

	const blockProps = useBlockProps({
		style:
			width === 'Full' ? { maxWidth: 'none', width: '100%' } : undefined,
	}) as DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

	return (
		<div {...blockProps}>
			<Suspense
				fallback={
					<div style={{ minHeight: 400, padding: 20 }}>
						{__('Loading booking flow…', 'appointments-booking')}
					</div>
				}
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
			</Suspense>
			<InspectorControls>
				<Panel>
					<PanelBody title={__('General', 'appointments-booking')}>
						<SelectControl
							label={__('Flow type', 'appointments-booking')}
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
							label={__(
								'Hide step titles',
								'appointments-booking'
							)}
							help={__(
								'Hide all section headings from the booking flow',
								'appointments-booking'
							)}
							checked={attributes.hideStepTitles}
							onChange={(hideStepTitles) =>
								setAttributes({ hideStepTitles })
							}
						/>
						{isMultiStep && (
							<>
								<SelectControl
									label={__(
										'Preview step',
										'appointments-booking'
									)}
									value={String(editorStep)}
									options={[
										{
											label: __(
												'1. Select date',
												'appointments-booking'
											),
											value: '0',
										},
										{
											label: __(
												'2. Customer info',
												'appointments-booking'
											),
											value: '1',
										},
									]}
									onChange={(v) => setEditorStep(Number(v))}
								/>
								<ToggleControl
									label={__(
										'Hide progress bar',
										'appointments-booking'
									)}
									help={__(
										'Hide the step indicator at the top of the booking flow',
										'appointments-booking'
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
						<PanelBody
							title={__('Calendar', 'appointments-booking')}
						>
							<ToggleControl
								label={__(
									'Trim time slots outside of working hours',
									'appointments-booking'
								)}
								help={__(
									'When showing the time picker, hide time slots that are not available for booking before and after opening hours',
									'appointments-booking'
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
										'appointments-booking'
									)}
									help={__(
										'Shows the available time slots as buttons. Recommended if you have a lot of traffic from mobile devices',
										'appointments-booking'
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
									'appointments-booking'
								)}
								help={__(
									'Display the calendar and time slots side by side instead of stacked vertically',
									'appointments-booking'
								)}
								checked={attributes.inlineTimePicker}
								onChange={(inlineTimePicker) =>
									setAttributes({ inlineTimePicker })
								}
							/>
						</PanelBody>
					)}
					<PanelBody title={__('Alignment', 'appointments-booking')}>
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
								label={__('Align left', 'appointments-booking')}
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
								label={__(
									'Align center',
									'appointments-booking'
								)}
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
								label={__(
									'Align right',
									'appointments-booking'
								)}
							/>
						</ButtonGroup>
					</PanelBody>
					<PanelBody title={__('Size', 'appointments-booking')}>
						<ButtonGroup>
							<Button
								variant={
									width === 'Narrow' ? 'primary' : 'secondary'
								}
								onClick={() =>
									setAttributes({ width: 'Narrow' })
								}
								icon={<Icon icon={column} />}
								label={__(
									'Size narrow',
									'appointments-booking'
								)}
							/>
							<Button
								variant={
									width === 'Full' ? 'primary' : 'secondary'
								}
								onClick={() => setAttributes({ width: 'Full' })}
								icon={<Icon icon={stretchFullWidth} />}
								label={__(
									'Size full width',
									'appointments-booking'
								)}
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
