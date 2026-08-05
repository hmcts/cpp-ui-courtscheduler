import { DateRangeFormatPipe } from '../date-range-format.pipe';

describe('DateRangeFormatPipe', () => {
  let pipe: DateRangeFormatPipe;

  beforeEach(() => {
    pipe = new DateRangeFormatPipe();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(pipe).toBeTruthy();
  });

  it('should return "Not added" when startDate is null', () => {
    expect.assertions(1);

    const result = pipe.transform({
      startDate: null,
      endDate: '2026-01-31'
    });

    expect(result).toBe('Not added');
  });

  it('should return "Not added" when endDate is null', () => {
    expect.assertions(1);

    const result = pipe.transform({
      startDate: '2026-01-01',
      endDate: null
    });

    expect(result).toBe('Not added');
  });

  it('should return "Not added" when both dates are null', () => {
    expect.assertions(1);

    const result = pipe.transform({
      startDate: null,
      endDate: null
    });

    expect(result).toBe('Not added');
  });

  it('should format date range with default separator', () => {
    expect.assertions(3);

    const result = pipe.transform({
      startDate: '2026-01-01',
      endDate: '2026-01-31'
    });

    expect(result).toContain('1 January 2026');
    expect(result).toContain('31 January 2026');
    expect(result).toContain(' - ');
  });

  it('should format date range with custom separator', () => {
    expect.assertions(3);

    const result = pipe.transform(
      {
        startDate: '2026-01-01',
        endDate: '2026-01-31'
      },
      ' to '
    );

    expect(result).toContain('1 January 2026');
    expect(result).toContain('31 January 2026');
    expect(result).toContain(' to ');
  });

  it('should return only start date when start and end dates are the same', () => {
    expect.assertions(2);

    const result = pipe.transform({
      startDate: '2026-01-15',
      endDate: '2026-01-15'
    });

    expect(result).toBe('15 January 2026');
    expect(result).not.toContain(' - ');
  });

  it('should return only start date when dates are same but different times', () => {
    expect.assertions(1);

    const result = pipe.transform({
      startDate: '2026-01-15T00:00:00',
      endDate: '2026-01-15T23:59:59'
    });

    expect(result).toBe('15 January 2026');
  });

  it('should format dates correctly for different months', () => {
    expect.assertions(2);

    const result = pipe.transform({
      startDate: '2026-01-01',
      endDate: '2026-02-28'
    });

    expect(result).toContain('1 January 2026');
    expect(result).toContain('28 February 2026');
  });

  it('should format dates correctly for different years', () => {
    expect.assertions(2);

    const result = pipe.transform({
      startDate: '2025-12-01',
      endDate: '2026-01-31'
    });

    expect(result).toContain('1 December 2025');
    expect(result).toContain('31 January 2026');
  });
});
