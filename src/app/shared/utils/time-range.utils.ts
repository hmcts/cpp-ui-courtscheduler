import { VALIDATION } from './session-form.config';
import { SessionType } from '../model/session';
import { ErrorMessageConfig } from '@cpp/pdk';

export interface TimeRange {
  min: string;
  max: string;
}

const defaultTimeRange: TimeRange = { min: '01:00', max: '23:00' };

export const getTimeRange = (
  sessionType: SessionType | undefined,
  sessionTypeRanges: Record<string, TimeRange>
): TimeRange => {
  return sessionType ? sessionTypeRanges[sessionType] : defaultTimeRange;
};

export const getTimeRangeErrorMessages = (): {
  start: ErrorMessageConfig[];
  end: ErrorMessageConfig[];
} => {
  return {
    start: [
      { rule: 'timeRange', message: VALIDATION.timeRange('Start') },
      { rule: 'required', message: VALIDATION.startTime }
    ],
    end: [
      { rule: 'timeRange', message: VALIDATION.timeRange('End') },
      { rule: 'required', message: VALIDATION.endTime },
      { rule: 'endTimeAfterStartTime', message: VALIDATION.endTimeAfterStartTime }
    ]
  };
};
