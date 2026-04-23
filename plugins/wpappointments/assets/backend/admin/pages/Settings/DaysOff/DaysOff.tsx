import { useState } from 'react';
import {
	Button,
	Card,
	CardFooter,
	CardHeader,
	Tooltip,
	__experimentalText as Text,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
import {
	CardBody,
	CheckboxInput,
	DataForm,
	DateRangePicker,
	SelectInput,
	SlideoutHeaderActionsFill,
	TextareaInput,
	useFormValidity,
} from '@wpappointments/components';
import type { Field, Form } from '@wpappointments/components';
import { useSlideout } from '@wpappointments/data';
import type { OooEntry, OooReason } from '~/backend/store/ooo/ooo.types';
import { store } from '~/backend/store/store';
import styles from './DaysOff.module.css';
import HolidayGroupList from './HolidayGroupList';
import {
	createOooEntry,
	updateOooEntry,
	deleteOooEntry,
} from '~/backend/api/ooo';
import globalStyles from 'global.module.css';

const REASON_LABELS: Record<OooReason, string> = {
	unspecified: __('Unspecified', 'wpappointments'),
	vacation: __('Vacation', 'wpappointments'),
	travel: __('Travel', 'wpappointments'),
	sick_leave: __('Sick Leave', 'wpappointments'),
	holiday: __('Holiday', 'wpappointments'),
};

const REASON_OPTIONS = Object.entries(REASON_LABELS).map(([value, label]) => ({
	label,
	value,
}));

function formatDateRange(start: string, end: string): string {
	if (start === end) {
		return start;
	}
	return `${start} — ${end}`;
}

function OooRow({ entry, onClick }: { entry: OooEntry; onClick: () => void }) {
	return (
		<div
			className={styles.oooRow}
			onClick={onClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onClick();
				}
			}}
		>
			<div className={styles.oooInfo}>
				<span className={styles.oooDate}>
					{formatDateRange(entry.startDate, entry.endDate)}
				</span>
				<span className={styles.oooReasonBadge}>
					{REASON_LABELS[entry.reason] || entry.reason}
				</span>
				{entry.notes && (
					<span className={styles.oooNotes}>
						{entry.notes.length > 50
							? `${entry.notes.substring(0, 50)}...`
							: entry.notes}
					</span>
				)}
			</div>
		</div>
	);
}

type OooFormData = {
	reason: OooReason;
	notes: string;
	note_public: boolean;
};

function OooEditor({ entry }: { entry?: OooEntry }) {
	const { closeSlideOut, currentSlideout } = useSlideout();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const generalSettings = useSelect(
		(select) => select(store).getGeneralSettings(),
		[]
	);
	const startOfWeekSetting = generalSettings?.startOfWeek ?? 1;

	const parseYmd = (value: string) => {
		const [year, month, day] = value.split('-').map(Number);
		return new Date(year, month - 1, day);
	};

	const [rangeStart, setRangeStart] = useState<Date | null>(
		entry ? parseYmd(entry.startDate) : null
	);
	const [rangeEnd, setRangeEnd] = useState<Date | null>(
		entry ? parseYmd(entry.endDate) : null
	);

	const [formData, setFormData] = useState<OooFormData>(() => ({
		reason: entry?.reason ?? 'unspecified',
		notes: entry?.notes ?? '',
		note_public: entry?.notePublic ?? false,
	}));

	const slideoutId = entry ? `ooo-${entry.id}` : 'ooo-new';

	const fields: Field<OooFormData>[] = [
		{
			id: 'reason',
			type: 'text',
			label: __('Reason', 'wpappointments'),
			elements: REASON_OPTIONS,
			Edit: SelectInput,
		},
		{
			id: 'notes',
			type: 'text',
			label: __('Notes', 'wpappointments'),
			Edit: TextareaInput,
		},
		{
			id: 'note_public',
			type: 'boolean',
			label: __(
				'Show note in customer-facing calendar',
				'wpappointments'
			),
			Edit: CheckboxInput,
		},
	];

	const form: Form = {
		layout: { type: 'regular' },
		fields: ['reason', 'notes', 'note_public'],
	};

	const { validity } = useFormValidity(formData, fields, form);

	const handleChange = (edits: Record<string, unknown>) => {
		setFormData((prev) => ({ ...prev, ...edits }));
	};

	const formatYmd = (date: Date | null) =>
		date
			? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
			: '';

	const handleSubmit = async () => {
		if (!rangeStart) {
			setError(__('Please select a date range', 'wpappointments'));
			return;
		}

		setError(null);

		const payload = {
			...formData,
			start_date: formatYmd(rangeStart),
			end_date: formatYmd(rangeEnd || rangeStart),
		};

		setSaving(true);

		let result;
		try {
			result = entry
				? await updateOooEntry(entry.id, payload)
				: await createOooEntry(payload);
		} finally {
			setSaving(false);
		}

		if (result) {
			closeSlideOut(slideoutId);
		}
	};

	const handleDelete = async () => {
		if (!entry || saving) return;
		setSaving(true);

		let result;
		try {
			result = await deleteOooEntry(entry.id);
		} finally {
			setSaving(false);
		}

		if (result) {
			closeSlideOut(slideoutId);
		}
	};

	const isTopSlideout = currentSlideout?.id === slideoutId;

	return (
		<>
			{entry && isTopSlideout && (
				<SlideoutHeaderActionsFill>
					<Tooltip text={__('Delete time off', 'wpappointments')}>
						<Button
							icon={trash}
							isDestructive
							disabled={saving}
							onClick={handleDelete}
							label={__('Delete time off', 'wpappointments')}
						/>
					</Tooltip>
				</SlideoutHeaderActionsFill>
			)}
			<div className={styles.editorContent}>
				<div>
					<p className={styles.dateLabel}>
						{rangeStart && rangeEnd
							? `${formatYmd(rangeStart)} — ${formatYmd(rangeEnd)}`
							: rangeStart
								? `${formatYmd(rangeStart)} — ${__('select end date', 'wpappointments')}`
								: __('Select date range', 'wpappointments')}
					</p>
					<DateRangePicker
						startDate={rangeStart}
						endDate={rangeEnd}
						onChange={(start, end) => {
							setRangeStart(start);
							setRangeEnd(end);
							setError(null);
						}}
						startOfWeek={
							startOfWeekSetting as 0 | 1 | 2 | 3 | 4 | 5 | 6
						}
					/>
					{error && (
						<p style={{ color: '#cc1818', marginTop: '8px' }}>
							{error}
						</p>
					)}
				</div>
				<DataForm
					data={formData}
					fields={fields}
					form={form}
					onChange={handleChange}
					validity={validity}
				/>

				<Button
					variant="primary"
					onClick={handleSubmit}
					isBusy={saving}
					style={{
						width: '100%',
						justifyContent: 'center',
						padding: '22px 0px',
						marginTop: '16px',
					}}
				>
					{entry
						? __('Save changes', 'wpappointments')
						: __('Add time off', 'wpappointments')}
				</Button>
			</div>
		</>
	);
}

export default function DaysOffSettings() {
	const { openSlideOut } = useSlideout();

	const entries = useSelect((select) => select(store).getOooEntries(), []);

	const handleOpen = (entry: OooEntry) => () => {
		openSlideOut({
			id: `ooo-${entry.id}`,
			title: REASON_LABELS[entry.reason] || entry.reason,
			content: <OooEditor entry={entry} />,
		});
	};

	const handleCreate = () => {
		openSlideOut({
			id: 'ooo-new',
			title: __('Add time off', 'wpappointments'),
			content: <OooEditor />,
		});
	};

	return (
		<>
			<Card className={globalStyles.card}>
				<CardHeader>
					<Text size="title">
						{__('Your time off', 'wpappointments')}
					</Text>
				</CardHeader>
				<CardBody style={{ padding: 0 }}>
					<div className={styles.oooList}>
						{entries.map((entry) => (
							<OooRow
								key={entry.id}
								entry={entry}
								onClick={handleOpen(entry)}
							/>
						))}
						{entries.length === 0 && (
							<div className={styles.emptyState}>
								{__('No time off scheduled.', 'wpappointments')}
							</div>
						)}
					</div>
				</CardBody>
				<CardFooter>
					<Button variant="secondary" onClick={handleCreate}>
						{__('Add time off', 'wpappointments')}
					</Button>
				</CardFooter>
			</Card>
			<HolidayGroupList />
		</>
	);
}
