import { FormatTimePipe } from './format-time.pipe';

describe('FormatTimePipe', () => {
  let pipe: FormatTimePipe;
  const formatSessionTimeSpy = jest.fn();

  beforeEach(() => {
    pipe = new FormatTimePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for nullish input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should return formatted time with meridiem by default', () => {
    formatSessionTimeSpy.mockReturnValue('10:30am');
    expect(pipe.transform('10:30')).toBe('10:30am');
  });

  describe('12h format', () => {
    it('should show meridiem by default', () => {
      formatSessionTimeSpy.mockReturnValue('2:45pm');
      expect(pipe.transform('14:45')).toBe('2:45pm');
    });

    it('should hide meridiem when hideMeridiem is true', () => {
      formatSessionTimeSpy.mockReturnValue('2:45pm');
      expect(pipe.transform('14:45', { hideMeridiem: true })).toBe('2:45');
    });
  });

  describe('24h format', () => {
    it('should show meridiem by default in 24h format', () => {
      formatSessionTimeSpy.mockReturnValue('2:45pm');
      expect(pipe.transform('14:45', { format24h: true })).toBe('14:45pm');
    });

    it('should hide meridiem in 24h format when hideMeridiem is true', () => {
      formatSessionTimeSpy.mockReturnValue('2:45pm');
      expect(pipe.transform('14:45', { format24h: true, hideMeridiem: true })).toBe('14:45');
    });

    it('should handle edge cases in 24h format', () => {
      // Midnight
      formatSessionTimeSpy.mockReturnValue('12:00am');
      expect(pipe.transform('00:00', { format24h: true })).toBe('00:00am');
      expect(pipe.transform('00:00', { format24h: true, hideMeridiem: true })).toBe('00:00');

      // Noon
      formatSessionTimeSpy.mockReturnValue('12:00pm');
      expect(pipe.transform('12:00', { format24h: true })).toBe('12:00pm');
      expect(pipe.transform('12:00', { format24h: true, hideMeridiem: true })).toBe('12:00');

      // 1 AM
      formatSessionTimeSpy.mockReturnValue('1:05am');
      expect(pipe.transform('01:05', { format24h: true })).toBe('01:05am');
      expect(pipe.transform('01:05', { format24h: true, hideMeridiem: true })).toBe('01:05');

      // 11 PM
      formatSessionTimeSpy.mockReturnValue('11:59pm');
      expect(pipe.transform('23:59', { format24h: true })).toBe('23:59pm');
      expect(pipe.transform('23:59', { format24h: true, hideMeridiem: true })).toBe('23:59');
    });
  });
});
