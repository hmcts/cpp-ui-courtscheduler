import {
  addDaysToDate,
  getDisplayText,
  isDateNotMonday,
  isDateBetweenRange,
  getInsetLabel,
  getSundaysAfterStartDate,
  TWO_YEARS_IN_WEEKS,
  parseDateToString,
  parseDateToLocaleString
} from './date-utils';

describe('Date Utilities', () => {
  describe('addDaysToDate', () => {
    it('should correctly add days to a given date', () => {
      const date = new Date('2023-01-01');
      const result = addDaysToDate(date, 5);
      expect(result).toEqual(new Date('2023-01-06'));
    });
  });

  describe('getDisplayText', () => {
    it('should format the display text correctly when both dates are provided', () => {
      const startDate: Date | undefined = new Date('2023-01-01');
      const endDate: Date | undefined = new Date('2023-01-07');
      const result = getDisplayText(startDate, endDate);
      expect(result).toBe('From 1 Jan 2023 to 7 Jan 2023');
    });

    it('should return an empty string when startDate is undefined', () => {
      const startDate: Date | undefined = undefined;
      const endDate: Date | undefined = new Date('2023-01-07');
      const result = getDisplayText(startDate, endDate);
      expect(result).toBe('');
    });

    it('should return an empty string when endDate is undefined', () => {
      const startDate: Date | undefined = new Date('2023-01-01');
      const endDate: Date | undefined = undefined;
      const result = getDisplayText(startDate, endDate);
      expect(result).toBe('');
    });

    it('should return an empty string when both dates are undefined', () => {
      const startDate: Date | undefined = undefined;
      const endDate: Date | undefined = undefined;
      const result = getDisplayText(startDate, endDate);
      expect(result).toBe('');
    });
  });

  describe('isDateNotMonday', () => {
    it('should return true for a date that is not a Monday', () => {
      const date = new Date('2023-01-03'); // Tuesday
      expect(isDateNotMonday(date)).toBe(true);
    });

    it('should return false for a date that is a Monday', () => {
      const date = new Date('2023-01-02'); // Monday
      expect(isDateNotMonday(date)).toBe(false);
    });
  });

  describe('isDateBetweenRange', () => {
    it('should return true if the date is within the target date range when targetDate is a string', () => {
      const date = new Date('2023-01-04');
      const targetDate = '2023-01-01';
      expect(isDateBetweenRange(date, targetDate)).toBe(true);
    });

    it('should return false if the date is not within the target date range when targetDate is a string', () => {
      const date = new Date('2023-01-10');
      const targetDate = '2023-01-01';
      expect(isDateBetweenRange(date, targetDate)).toBe(false);
    });

    it('should return true if the date is within the target date range when targetDate is a Date object', () => {
      const date = new Date('2023-01-04');
      const targetDate = new Date('2023-01-01');
      expect(isDateBetweenRange(date, targetDate)).toBe(true);
    });

    it('should return false if the date is not within the target date range when targetDate is a Date object', () => {
      const date = new Date('2023-01-10');
      const targetDate = new Date('2023-01-01');
      expect(isDateBetweenRange(date, targetDate)).toBe(false);
    });
  });

  describe('getInsetLabel', () => {
    it('should return the correct inset label for a given date', () => {
      const date = new Date('2023-01-01');
      const result = getInsetLabel(date);
      expect(result).toBe('Selected day: Sunday');
    });
  });

  describe('getSundaysAfterStartDate', () => {
    it('should return the correct Sundays after a given start date', () => {
      const startDate = '2023-01-02'; // Monday
      const result = getSundaysAfterStartDate(startDate, 1);
      expect(result.length).toBe(TWO_YEARS_IN_WEEKS + 1);
      expect(result[0]).toEqual(new Date('2023-01-08')); // First Sunday after start date
    });
  });

  describe('parseDateToString', () => {
    it('should correctly parse a date object to a string', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      const result = parseDateToString(date);
      expect(result).toBe('2023-01-01');
    });

    it('should return the same string if the input is already a string', () => {
      const date = '2023-01-01';
      const result = parseDateToString(date);
      expect(result).toBe('2023-01-01');
    });
  });

  describe('parseDateToLocaleString', () => {
    it('should correctly parse a date object to a locale string', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      const result = parseDateToLocaleString(date);
      expect(result).toBe('01/01/2023');
    });

    it('should correctly parse a date string to a locale string', () => {
      const date = '2023-01-01';
      const result = parseDateToLocaleString(date);
      expect(result).toBe('01/01/2023');
    });
  });

  describe('parseDateToString', () => {
    it('should correctly parse a date string to a Date object', () => {
      const dateString = '2023-01-01';
      const result = parseDateToString(dateString);
      expect(result).toEqual('2023-01-01');
    });

    it('should return null when dateString is undefined', () => {
      const result = parseDateToString(undefined);
      expect(result).toBeNull();
    });

    it('should return null when dateString is an empty string', () => {
      const result = parseDateToString('');
      expect(result).toBeNull();
    });
  });
});
