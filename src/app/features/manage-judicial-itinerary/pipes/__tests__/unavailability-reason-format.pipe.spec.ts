import { UnavailabilityReasonFormatPipe } from '../unavailability-reason-format.pipe';
import { UnavailabilityReason } from '../../model/unavailability.interface';

describe('UnavailabilityReasonFormatPipe', () => {
  let pipe: UnavailabilityReasonFormatPipe;

  beforeEach(() => {
    pipe = new UnavailabilityReasonFormatPipe();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(pipe).toBeTruthy();
  });

  it('should format TRAINING to "Training"', () => {
    expect.assertions(1);

    const result = pipe.transform(UnavailabilityReason.TRAINING);
    expect(result).toBe('Training');
  });

  it('should format ANNUAL_LEAVE to "Annual leave"', () => {
    expect.assertions(1);

    const result = pipe.transform(UnavailabilityReason.ANNUAL_LEAVE);
    expect(result).toBe('Annual leave');
  });

  it('should format SICK_LEAVE to "Sick leave"', () => {
    expect.assertions(1);

    const result = pipe.transform(UnavailabilityReason.SICK_LEAVE);
    expect(result).toBe('Sick leave');
  });

  it('should format OFFICIAL_BUSINESS to "Official business"', () => {
    expect.assertions(1);

    const result = pipe.transform(UnavailabilityReason.OFFICIAL_BUSINESS);
    expect(result).toBe('Official business');
  });

  it('should return "Unknown" for unknown reasons', () => {
    expect.assertions(1);

    const result = pipe.transform('UNKNOWN' as UnavailabilityReason);
    expect(result).toBe('Unknown');
  });
});
