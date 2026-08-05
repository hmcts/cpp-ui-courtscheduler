import { SelectOption } from '@cpp/pdk';
import { PanelTypeUnion } from '../model/panel';
import { DayOfWeek } from '../model/days';
import {
  CourtroomAssignmentType,
  CourtroomAssignmentTypeUnion
} from '../model/courtroom-assignment';

export const PANEL_OPTIONS: readonly SelectOption<PanelTypeUnion>[] = [
  { value: 'ADULT', label: 'Adult' },
  { value: 'YOUTH', label: 'Youth' }
] as const;

export const REPEAT_DAYS: readonly { label: string; value: DayOfWeek }[] = [
  { label: 'Monday', value: DayOfWeek.Monday },
  { label: 'Tuesday', value: DayOfWeek.Tuesday },
  { label: 'Wednesday', value: DayOfWeek.Wednesday },
  { label: 'Thursday', value: DayOfWeek.Thursday },
  { label: 'Friday', value: DayOfWeek.Friday },
  { label: 'Saturday', value: DayOfWeek.Saturday }
] as const;

export const VALIDATION = {
  courtroom: 'Select a courtroom',
  sessionType: 'Select a session type',
  duration: 'Enter a duration',
  slot: 'Enter a number of slots',
  morningDuration: 'AM duration is required',
  afternoonDuration: 'PM duration is required',
  allDaySplit: 'Enter the split session details',
  panel: 'Enter a panel',
  repeatDays: 'Select an option',
  repeatDay: 'Select a day',
  startTime: 'Enter a start time',
  endTime: 'Enter an end time',
  timeRange: (prefix: 'Start' | 'End') => `${prefix} time must be between {{min}} and {{max}}`,
  endTimeAfterStartTime: 'End time must be after start time',
  courtroomAssignment: 'Select a courtroom assignment'
} as const;

export const COURTROOM_ASSIGNMENT_OPTIONS: readonly SelectOption<CourtroomAssignmentTypeUnion>[] = [
  { value: CourtroomAssignmentType.ASSIGNED, label: 'Assigned' },
  { value: CourtroomAssignmentType.DRAFT, label: 'Draft' }
] as const;

export const INDEX_OCURRENCE_OPTIONS: readonly SelectOption<number>[] = [
  { value: 1, label: '1st' },
  { value: 2, label: '2nd' },
  { value: 3, label: '3rd' },
  { value: 4, label: '4th' }
] as const;
