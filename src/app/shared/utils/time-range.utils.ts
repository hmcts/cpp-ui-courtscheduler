import { VALIDATION } from './session-form.config';
import { SessionType } from '../model/session';

export interface TimeRange {
  min: string;
  max: string;
}

export interface TimeRangeError {
  rule: string;
  message: string;
}

const defaultTimeRange: TimeRange = { min: '01:00', max: '23:00' };

export const getTimeRange = (
  sessionType: SessionType | undefined,
  sessionTypeRanges: Record<string, TimeRange>
): TimeRange => {
  return sessionType ? sessionTypeRanges[sessionType] : defaultTimeRange;
};

export const getTimeRangeErrorMessages = (
  sessionType: SessionType | undefined,
  timeRange: TimeRange
): { start: TimeRangeError[]; end: TimeRangeError[] } => {
  const { min, max } = timeRange;
  const range = sessionType ? `${min} to ${max}` : '';

  return {
    start: [
      { rule: 'timeRange', message: sessionType ? `Start time must be between ${range}` : '' },
      { rule: 'required', message: VALIDATION.startTime }
    ],
    end: [
      { rule: 'timeRange', message: sessionType ? `End time must be between ${range}` : '' },
      { rule: 'required', message: VALIDATION.endTime },
      { rule: 'endTimeAfterStartTime', message: VALIDATION.endTimeAfterStartTime }
    ]
  };
};

export const updateErrorMessages = (
  startTimeErrors: TimeRangeError[],
  endTimeErrors: TimeRangeError[],
  sessionType: SessionType | undefined,
  timeRange: TimeRange
): void => {
  const { start, end } = getTimeRangeErrorMessages(sessionType, timeRange);

  const startTimeRangeError = startTimeErrors.find((e) => e.rule === 'timeRange');
  const endTimeRangeError = endTimeErrors.find((e) => e.rule === 'timeRange');

  if (startTimeRangeError) {
    startTimeRangeError.message = start.find((e) => e.rule === 'timeRange')!.message;
  }

  if (endTimeRangeError) {
    endTimeRangeError.message = end.find((e) => e.rule === 'timeRange')!.message;
  }
};
