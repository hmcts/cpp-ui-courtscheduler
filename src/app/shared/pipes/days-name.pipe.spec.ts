import { DaysNamePipe } from './days-name.pipe';

describe('DaysNamePipe', () => {
  let pipe: DaysNamePipe;

  beforeEach(() => {
    pipe = new DaysNamePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string if no days are provided', () => {
    expect(pipe.transform([])).toBe('');
    expect(pipe.transform(null)).toBe('');
  });

  it('should return day names for given days', () => {
    const days = ['MON', 'WED', 'FRI'];
    const result = pipe.transform(days);
    expect(result).toBe('Monday, Wednesday, Friday');
  });

  it('should return day names for a single day', () => {
    const days = ['TUE'];
    const result = pipe.transform(days);
    expect(result).toBe('Tuesday');
  });

  it('should handle invalid values', () => {
    const days = ['MON', 'INVALID', 'FRI'];
    const result = pipe.transform(days);
    expect(result).toBe('Monday, , Friday');
  });

  it('should return the correct day names in the correct order', () => {
    const days = ['SUN', 'SAT', 'MON'];
    const result = pipe.transform(days);
    expect(result).toBe('Sunday, Saturday, Monday');
  });
});
