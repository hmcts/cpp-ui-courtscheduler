import { SessionType } from '../model/session';
import { VALIDATION } from './session-form.config';
import { TimeRange, getTimeRange, getTimeRangeErrorMessages } from './time-range.utils';

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
    it('should return start and end error message arrays', () => {
      const result = getTimeRangeErrorMessages();
      expect(result.start).toBeDefined();
      expect(result.end).toBeDefined();
    });

    it('should include timeRange rule in start messages', () => {
      const { start } = getTimeRangeErrorMessages();
      expect(start).toContainEqual(jasmine.objectContaining({ rule: 'timeRange' }));
    });

    it('should include required rule with startTime message in start messages', () => {
      const { start } = getTimeRangeErrorMessages();
      expect(start).toContainEqual({ rule: 'required', message: VALIDATION.startTime });
    });

    it('should include timeRange rule in end messages', () => {
      const { end } = getTimeRangeErrorMessages();
      expect(end).toContainEqual(jasmine.objectContaining({ rule: 'timeRange' }));
    });

    it('should include required rule with endTime message in end messages', () => {
      const { end } = getTimeRangeErrorMessages();
      expect(end).toContainEqual({ rule: 'required', message: VALIDATION.endTime });
    });

    it('should include endTimeAfterStartTime rule in end messages', () => {
      const { end } = getTimeRangeErrorMessages();
      expect(end).toContainEqual({
        rule: 'endTimeAfterStartTime',
        message: VALIDATION.endTimeAfterStartTime
      });
    });
  });
});
