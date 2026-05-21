import { useMemo } from 'react';
import {
	Button,
	Card,
	CardFooter,
	CardHeader,
	ToggleControl,
	__experimentalText as Text,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
import { CardBody } from '@wpappointments/components';
import { useSlideout } from '@wpappointments/data';
import { getHolidayName, getGroupName } from '@wpappointments/holidays';
import type {
	HolidayGroup,
	HolidayDetail,
} from '~/backend/store/holidays/holidays.types';
import { store } from '~/backend/store/store';
import AddHolidayGroupSlideout from './AddHolidayGroupSlideout';
import styles from './DaysOff.module.css';
import {
	toggleHolidayGroup,
	removeHolidayGroup,
	toggleHoliday,
} from '~/backend/api/holidays';
import globalStyles from 'global.module.css';

type RefOwner = {
	groupId: string;
	groupSource: string;
	enabled: boolean;
};

type RefOwnership = Map<string, RefOwner>;

function buildRefOwnership(groups: HolidayGroup[]): RefOwnership {
	const ownership: RefOwnership = new Map();

	for (const group of groups) {
		if (!group.enabled) continue;

		for (const holiday of group.holidays) {
			// Only claim ownership when the holiday is actually enabled in
			// this group. A disabled holiday shouldn't lock the same ref
			// out of every later group — those rows should remain
			// independently toggleable.
			if (holiday.ref && holiday.enabled && !ownership.has(holiday.ref)) {
				ownership.set(holiday.ref, {
					groupId: group.id,
					groupSource: group.source,
					enabled: holiday.enabled,
				});
			}
		}
	}

	return ownership;
}

function HolidayRow({
	group,
	holiday,
	owner,
}: {
	group: HolidayGroup;
	holiday: HolidayDetail;
	owner: RefOwner | undefined;
}) {
	const currentYear = new Date().getFullYear();
	const date = holiday.dates[currentYear];
	const isManaged = owner !== undefined && owner.groupId !== group.id;
	const isActive = isManaged ? owner.enabled : holiday.enabled;

	const handleToggle = (enabled: boolean) => {
		toggleHoliday(group.id, holiday.ref, enabled);
	};

	return (
		<div className={styles.holidayInlineRow}>
			<div className={styles.holidayInlineInfo}>
				<span
					className={
						!isActive || isManaged
							? styles.holidayInlineNameDisabled
							: styles.holidayInlineName
					}
				>
					{getHolidayName(holiday.ref)}
				</span>
				{date && (
					<span className={styles.holidayInlineDate}>{date}</span>
				)}
				{isManaged && (
					<span className={styles.managedByBadge}>
						{getGroupName(owner.groupSource)}
					</span>
				)}
			</div>
			{!isManaged && (
				<ToggleControl
					__nextHasNoMarginBottom
					checked={holiday.enabled}
					onChange={handleToggle}
					label=""
					aria-label={getHolidayName(holiday.ref)}
				/>
			)}
		</div>
	);
}

function HolidayGroupSection({
	group,
	refOwnership,
}: {
	group: HolidayGroup;
	refOwnership: RefOwnership;
}) {
	const handleToggleGroup = (enabled: boolean) => {
		toggleHolidayGroup(group.id, enabled);
	};

	const handleRemove = () => {
		removeHolidayGroup(group.id);
	};

	return (
		<div className={styles.holidayGroupSection}>
			<div className={styles.holidayGroupHeader}>
				<div className={styles.holidayGroupHeaderLeft}>
					<span className={styles.holidayGroupName}>
						{getGroupName(group.source)}
					</span>
					<span className={styles.holidayTypeBadge}>
						{group.type === 'country'
							? __('Country', 'appstip-appointments')
							: __('Religious', 'appstip-appointments')}
					</span>
				</div>
				<div className={styles.holidayGroupHeaderRight}>
					<ToggleControl
						__nextHasNoMarginBottom
						checked={group.enabled}
						onChange={handleToggleGroup}
						label=""
						aria-label={getGroupName(group.source)}
					/>
					<Button
						icon={trash}
						isDestructive
						size="small"
						onClick={handleRemove}
						label={__(
							'Remove holiday group',
							'appstip-appointments'
						)}
					/>
				</div>
			</div>
			{group.enabled && (
				<div className={styles.holidayInlineList}>
					{group.holidays.map((holiday) => (
						<HolidayRow
							key={holiday.ref}
							group={group}
							holiday={holiday}
							owner={
								holiday.ref
									? refOwnership.get(holiday.ref)
									: undefined
							}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default function HolidayGroupList() {
	const { openSlideOut } = useSlideout();

	const groups = useSelect((select) => {
		return select(store).getHolidayGroups();
	}, []);

	const refOwnership = useMemo(() => buildRefOwnership(groups), [groups]);

	const handleAdd = () => {
		openSlideOut({
			id: 'holiday-add',
			title: __('Add holidays', 'appstip-appointments'),
			content: <AddHolidayGroupSlideout />,
		});
	};

	return (
		<Card className={globalStyles.card}>
			<CardHeader>
				<Text size="title">
					{__('Holidays', 'appstip-appointments')}
				</Text>
			</CardHeader>
			<CardBody style={{ padding: 0 }}>
				{groups.length === 0 && (
					<div className={styles.emptyState}>
						{__(
							'No holiday groups added. Add a country or religious holiday set to automatically block those dates.',
							'appstip-appointments'
						)}
					</div>
				)}
				{groups.map((group) => (
					<HolidayGroupSection
						key={group.id}
						group={group}
						refOwnership={refOwnership}
					/>
				))}
			</CardBody>
			<CardFooter>
				<Button variant="secondary" onClick={handleAdd}>
					{__('Add holidays', 'appstip-appointments')}
				</Button>
			</CardFooter>
		</Card>
	);
}
