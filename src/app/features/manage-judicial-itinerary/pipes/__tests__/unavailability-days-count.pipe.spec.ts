import { UnavailabilityDaysCountPipe } from '../unavailability-days-count.pipe';
import { Unavailability, UnavailabilityReason } from '../../model/unavailability.interface';

describe('UnavailabilityDaysCountPipe', () => {
  let pipe: UnavailabilityDaysCountPipe;

  beforeEach(() => {
    pipe = new UnavailabilityDaysCountPipe();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(pipe).toBeTruthy();
  });

  it('should return 0 for empty array', () => {
    expect.assertions(1);
    expect(pipe.transform([])).toBe(0);
  });

  it('should return 0 for null', () => {
    expect.assertions(1);
    expect(pipe.transform(null as any)).toBe(0);
  });

  it('should return 0 for undefined', () => {
    expect.assertions(1);
    expect(pipe.transform(undefined as any)).toBe(0);
  });

  it('should count single day unavailability (weekday)', () => {
    expect.assertions(1);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: '2026-01-05',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];

    expect(pipe.transform(unavailabilities)).toBe(1);
  });

  it('should count multiple days unavailability (weekdays only)', () => {
    expect.assertions(1);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: '2026-01-09',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];

    expect(pipe.transform(unavailabilities)).toBe(5);
  });

  it('should exclude weekends from count', () => {
    expect.assertions(1);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-03',
        endDate: '2026-01-04',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];

    expect(pipe.transform(unavailabilities)).toBe(0);
  });

  it('should exclude weekends when range spans weekend', () => {
    expect.assertions(1);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-02',
        endDate: '2026-01-06',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];

    expect(pipe.transform(unavailabilities)).toBe(3);
  });

  it('should count unique days across multiple unavailabilities', () => {
    expect.assertions(1);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: '2026-01-07',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      },
      {
        startDate: '2026-01-09',
        endDate: '2026-01-09',
        reason: UnavailabilityReason.SICK_LEAVE
      }
    ];

    expect(pipe.transform(unavailabilities)).toBe(4);
  });

  it('should not count overlapping days twice', () => {
    expect.assertions(1);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: '2026-01-07',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      },
      {
        startDate: '2026-01-06',
        endDate: '2026-01-08',
        reason: UnavailabilityReason.SICK_LEAVE
      }
    ];

    expect(pipe.transform(unavailabilities)).toBe(4);
  });

  it('should handle unavailability with null endDate (single day)', () => {
    expect.assertions(1);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: null as any,
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];

    expect(pipe.transform(unavailabilities)).toBe(1);
  });

  it('should handle range that includes both weekdays and weekends', () => {
    expect.assertions(1);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-01',
        endDate: '2026-01-05',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];

    expect(pipe.transform(unavailabilities)).toBe(3);
  });

  it('should handle full week range (Monday to Friday)', () => {
    expect.assertions(1);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: '2026-01-09',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];

    expect(pipe.transform(unavailabilities)).toBe(5);
  });

  it('should handle range spanning multiple weeks', () => {
    expect.assertions(1);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: '2026-01-16',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];

    expect(pipe.transform(unavailabilities)).toBe(10);
  });
});
