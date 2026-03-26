import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import {
	Button,
	Button as WPButton,
	Card,
	CardFooter,
	CardHeader,
	Tooltip,
	__experimentalText as Text,
} from '@wordpress/components';
import { useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
import {
	CardBody,
	Checkbox,
	DateRangePicker,
	HtmlForm,
	Select,
	SlideoutHeaderActionsFill,
	Textarea,
	withForm,
} from '@wpappointments/components';
import { useSlideout } from '@wpappointments/data';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
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

type OooFormFields = {
	start_date: string;
	end_date: string;
	reason: OooReason;
	notes: string;
	note_public: boolean;
};

const OooEditor = withForm(function OooEditor({ entry }: { entry?: OooEntry }) {
	const { closeSlideOut, currentSlideout } = useSlideout();
	const [saving, setSaving] = useState(false);

	const generalSettings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);
	const startOfWeekSetting = generalSettings?.startOfWeek ?? 1;

	const [rangeStart, setRangeStart] = useState<Date | null>(
		entry ? new Date(entry.startDate) : null
	);
	const [rangeEnd, setRangeEnd] = useState<Date | null>(
		entry ? new Date(entry.endDate) : null
	);

	const slideoutId = entry ? `ooo-${entry.id}` : 'ooo-new';

	if (entry) {
		useFillFormValues({
			reason: entry.reason,
			notes: entry.notes,
			note_public: entry.notePublic,
		});
	}

	const formatYmd = (date: Date | null) =>
		date
			? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
			: '';

	const onSubmit: SubmitHandler<OooFormFields> = async (data) => {
		if (!rangeStart) return;

		const payload = {
			...data,
			start_date: formatYmd(rangeStart),
			end_date: formatYmd(rangeEnd || rangeStart),
		};

		setSaving(true);

		if (entry) {
			const result = await updateOooEntry(entry.id, payload);
			setSaving(false);
			if (result) {
				closeSlideOut(slideoutId);
			}
		} else {
			const result = await createOooEntry(payload);
			setSaving(false);
			if (result) {
				closeSlideOut(slideoutId);
			}
		}
	};

	const handleDelete = async () => {
		if (!entry) return;
		await deleteOooEntry(entry.id);
		closeSlideOut(slideoutId);
	};

	const isTopSlideout = currentSlideout?.id === slideoutId;

	return (
		<>
			{entry && isTopSlideout && (
				<SlideoutHeaderActionsFill>
					<Tooltip text={__('Delete time off', 'wpappointments')}>
						<WPButton
							icon={trash}
							isDestructive
							onClick={handleDelete}
							label={__('Delete time off', 'wpappointments')}
						/>
					</Tooltip>
				</SlideoutHeaderActionsFill>
			)}
			<HtmlForm onSubmit={onSubmit}>
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
							}}
							startOfWeek={
								startOfWeekSetting as 0 | 1 | 2 | 3 | 4 | 5 | 6
							}
						/>
					</div>
					<Select
						name="reason"
						label={__('Reason', 'wpappointments')}
						options={REASON_OPTIONS}
						defaultValue={'unspecified' as any}
					/>
					<Textarea
						name="notes"
						label={__('Notes', 'wpappointments')}
						rows={3}
					/>
					<Checkbox
						name="note_public"
						label={__(
							'Show note in customer-facing calendar',
							'wpappointments'
						)}
						defaultValue={false}
					/>

					<Button
						variant="primary"
						type="submit"
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
			</HtmlForm>
		</>
	);
});

export default function DaysOffSettings() {
	const { openSlideOut } = useSlideout();

	const entries = useSelect(() => {
		return select(store).getOooEntries();
	}, []);

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
