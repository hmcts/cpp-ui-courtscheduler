import { GroupUnavailabilitiesByReasonPipe } from '../group-unavailabilities-by-reason.pipe';
import { Unavailability, UnavailabilityReason } from '../../model/unavailability.interface';

describe('GroupUnavailabilitiesByReasonPipe', () => {
  let pipe: GroupUnavailabilitiesByReasonPipe;

  beforeEach(() => {
    pipe = new GroupUnavailabilitiesByReasonPipe();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(pipe).toBeTruthy();
  });

  it('should return empty Map when unavailabilities is null', () => {
    expect.assertions(2);

    const result = pipe.transform(null);
    expect(result).toEqual(new Map());
    expect(result.size).toBe(0);
  });

  it('should return empty Map when unavailabilities is undefined', () => {
    expect.assertions(2);

    const result = pipe.transform(undefined);
    expect(result).toEqual(new Map());
    expect(result.size).toBe(0);
  });

  it('should return empty Map when unavailabilities is empty array', () => {
    expect.assertions(2);

    const result = pipe.transform([]);
    expect(result).toEqual(new Map());
    expect(result.size).toBe(0);
  });

  it('should group unavailabilities by reason', () => {
    expect.assertions(3);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-01',
        endDate: '2026-01-05',
        reason: UnavailabilityReason.TRAINING
      },
      {
        startDate: '2026-02-01',
        endDate: '2026-02-05',
        reason: UnavailabilityReason.TRAINING
      },
      {
        startDate: '2026-03-01',
        endDate: '2026-03-05',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];

    const result = pipe.transform(unavailabilities);

    expect(result.size).toBe(2);
    expect(result.get(UnavailabilityReason.TRAINING)?.length).toBe(2);
    expect(result.get(UnavailabilityReason.ANNUAL_LEAVE)?.length).toBe(1);
  });

  it('should group all unavailabilities with same reason together', () => {
    expect.assertions(2);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-01',
        endDate: '2026-01-05',
        reason: UnavailabilityReason.SICK_LEAVE
      },
      {
        startDate: '2026-02-01',
        endDate: '2026-02-05',
        reason: UnavailabilityReason.SICK_LEAVE
      },
      {
        startDate: '2026-03-01',
        endDate: '2026-03-05',
        reason: UnavailabilityReason.SICK_LEAVE
      }
    ];

    const result = pipe.transform(unavailabilities);

    expect(result.size).toBe(1);
    expect(result.get(UnavailabilityReason.SICK_LEAVE)?.length).toBe(3);
  });

  it('should handle multiple different reasons', () => {
    expect.assertions(5);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-01',
        endDate: '2026-01-05',
        reason: UnavailabilityReason.TRAINING
      },
      {
        startDate: '2026-02-01',
        endDate: '2026-02-05',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      },
      {
        startDate: '2026-03-01',
        endDate: '2026-03-05',
        reason: UnavailabilityReason.SICK_LEAVE
      },
      {
        startDate: '2026-04-01',
        endDate: '2026-04-05',
        reason: UnavailabilityReason.OFFICIAL_BUSINESS
      }
    ];

    const result = pipe.transform(unavailabilities);

    expect(result.size).toBe(4);
    expect(result.get(UnavailabilityReason.TRAINING)?.length).toBe(1);
    expect(result.get(UnavailabilityReason.ANNUAL_LEAVE)?.length).toBe(1);
    expect(result.get(UnavailabilityReason.SICK_LEAVE)?.length).toBe(1);
    expect(result.get(UnavailabilityReason.OFFICIAL_BUSINESS)?.length).toBe(1);
  });
});
