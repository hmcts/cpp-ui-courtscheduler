import { SessionType } from '../model/session';
import { VALIDATION } from './session-form.config';
import {
  TimeRange,
  TimeRangeError,
  getTimeRange,
  getTimeRangeErrorMessages,
  updateErrorMessages
} from './time-range.utils';

describe('TimeRangeUtils', () => {
  const mockSessionTypeRanges: Record<string, TimeRange> = {
    AM: { min: '09:00', max: '13:00' },
    PM: { min: '14:00', max: '17:00' },
    AD: { min: '09:00', max: '17:00' }
  };

  describe('getTimeRange', () => {
    it('should return default time range when session type is undefined', () => {
      const result = getTimeRange(undefined, mockSessionTypeRanges);
      expect(result).toEqual({ min: '01:00', max: '23:00' });
    });

    it('should return correct time range for AM session', () => {
      const result = getTimeRange('AM' as SessionType, mockSessionTypeRanges);
      expect(result).toEqual({ min: '09:00', max: '13:00' });
    });

    it('should return correct time range for PM session', () => {
      const result = getTimeRange('PM' as SessionType, mockSessionTypeRanges);
      expect(result).toEqual({ min: '14:00', max: '17:00' });
    });

    it('should return correct time range for AD session', () => {
      const result = getTimeRange('AD' as SessionType, mockSessionTypeRanges);
      expect(result).toEqual({ min: '09:00', max: '17:00' });
    });
  });

  describe('getTimeRangeErrorMessages', () => {
    const timeRange: TimeRange = { min: '09:00', max: '13:00' };

    it('should return empty time range messages when session type is undefined', () => {
      const result = getTimeRangeErrorMessages(undefined, timeRange);
      expect(result.start[0].message).toBe('');
      expect(result.end[0].message).toBe('');
    });

    it('should return correct error messages for a given session type and time range', () => {
      const result = getTimeRangeErrorMessages('AM' as SessionType, timeRange);

      expect(result.start[0]).toEqual({
        rule: 'timeRange',
        message: 'Start time must be between 09:00 to 13:00'
      });
      expect(result.end[0]).toEqual({
        rule: 'timeRange',
        message: 'End time must be between 09:00 to 13:00'
      });
    });

    it('should include required validation messages', () => {
      const result = getTimeRangeErrorMessages('AM' as SessionType, timeRange);

      expect(result.start[1]).toEqual({
        rule: 'required',
        message: VALIDATION.startTime
      });
      expect(result.end[1]).toEqual({
        rule: 'required',
        message: VALIDATION.endTime
      });
    });

    it('should include endTimeAfterStartTime validation message', () => {
      const result = getTimeRangeErrorMessages('AM' as SessionType, timeRange);

      expect(result.end[2]).toEqual({
        rule: 'endTimeAfterStartTime',
        message: VALIDATION.endTimeAfterStartTime
      });
    });
  });

  describe('updateErrorMessages', () => {
    const timeRange: TimeRange = { min: '09:00', max: '13:00' };
    let startTimeErrors: TimeRangeError[];
    let endTimeErrors: TimeRangeError[];

    beforeEach(() => {
      startTimeErrors = [
        { rule: 'timeRange', message: 'old message' },
        { rule: 'required', message: VALIDATION.startTime }
      ];
      endTimeErrors = [
        { rule: 'timeRange', message: 'old message' },
        { rule: 'required', message: VALIDATION.endTime },
        { rule: 'endTimeAfterStartTime', message: VALIDATION.endTimeAfterStartTime }
      ];
    });

    it('should update existing error messages with new time range messages', () => {
      updateErrorMessages(startTimeErrors, endTimeErrors, 'AM' as SessionType, timeRange);

      expect(startTimeErrors[0].message).toBe('Start time must be between 09:00 to 13:00');
      expect(endTimeErrors[0].message).toBe('End time must be between 09:00 to 13:00');
    });

    it('should not modify other error messages', () => {
      updateErrorMessages(startTimeErrors, endTimeErrors, 'AM' as SessionType, timeRange);

      expect(startTimeErrors[1].message).toBe(VALIDATION.startTime);
      expect(endTimeErrors[1].message).toBe(VALIDATION.endTime);
      expect(endTimeErrors[2].message).toBe(VALIDATION.endTimeAfterStartTime);
    });

    it('should handle undefined session type', () => {
      updateErrorMessages(startTimeErrors, endTimeErrors, undefined, timeRange);

      expect(startTimeErrors[0].message).toBe('');
      expect(endTimeErrors[0].message).toBe('');
    });

    it('should handle missing timeRange error rule', () => {
      const startErrors: TimeRangeError[] = [{ rule: 'required', message: VALIDATION.startTime }];
      const endErrors: TimeRangeError[] = [{ rule: 'required', message: VALIDATION.endTime }];

      updateErrorMessages(startErrors, endErrors, 'AM' as SessionType, timeRange);

      // Should not throw and should not modify the arrays
      expect(startErrors).toEqual([{ rule: 'required', message: VALIDATION.startTime }]);
      expect(endErrors).toEqual([{ rule: 'required', message: VALIDATION.endTime }]);
    });
  });
});
