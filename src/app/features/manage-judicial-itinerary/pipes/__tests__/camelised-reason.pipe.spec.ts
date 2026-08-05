import { CamelisedReasonPipe } from '../camelised-reason.pipe';
import {
  UnavailabilityReason,
  CAMELISED_UNAVAILABILITY_REASONS_MAP
} from '../../model/unavailability.interface';

describe('CamelisedReasonPipe', () => {
  let pipe: CamelisedReasonPipe;

  beforeEach(() => {
    pipe = new CamelisedReasonPipe();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(pipe).toBeTruthy();
  });

  it('should transform ANNUAL_LEAVE to annualLeave', () => {
    expect.assertions(1);
    expect(pipe.transform(UnavailabilityReason.ANNUAL_LEAVE)).toBe('annualLeave');
  });

  it('should transform OFFICIAL_BUSINESS to officialBusiness', () => {
    expect.assertions(1);
    expect(pipe.transform(UnavailabilityReason.OFFICIAL_BUSINESS)).toBe('officialBusiness');
  });

  it('should transform SICK_LEAVE to sickLeave', () => {
    expect.assertions(1);
    expect(pipe.transform(UnavailabilityReason.SICK_LEAVE)).toBe('sickLeave');
  });

  it('should transform TRAINING to training', () => {
    expect.assertions(1);
    expect(pipe.transform(UnavailabilityReason.TRAINING)).toBe('training');
  });

  it('should return empty string for unknown reason', () => {
    expect.assertions(1);
    expect(pipe.transform('UNKNOWN' as UnavailabilityReason)).toBe('');
  });

  it('should transform all UnavailabilityReason values correctly', () => {
    expect.assertions(4);

    Object.values(UnavailabilityReason).forEach((reason) => {
      const expected = CAMELISED_UNAVAILABILITY_REASONS_MAP[reason];
      expect(pipe.transform(reason)).toBe(expected);
    });
  });
});
