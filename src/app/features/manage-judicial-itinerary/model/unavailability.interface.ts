export enum UnavailabilityReason {
  ANNUAL_LEAVE = 'ANNUAL_LEAVE',
  OFFICIAL_BUSINESS = 'OFFICIAL_BUSINESS',
  SICK_LEAVE = 'SICK_LEAVE',
  TRAINING = 'TRAINING'
}
export type CamelisedReasons = 'annualLeave' | 'officialBusiness' | 'sickLeave' | 'training';

export interface Unavailability {
  startDate: string;
  endDate: string;
  reason: UnavailabilityReason;
}

export const UNAVAILABILITY_REASONS_MAP: Record<UnavailabilityReason, string> = {
  [UnavailabilityReason.ANNUAL_LEAVE]: 'Annual leave',
  [UnavailabilityReason.OFFICIAL_BUSINESS]: 'Official business',
  [UnavailabilityReason.SICK_LEAVE]: 'Sick leave',
  [UnavailabilityReason.TRAINING]: 'Training'
} as const;

export const CAMELISED_UNAVAILABILITY_REASONS_MAP: Record<UnavailabilityReason, CamelisedReasons> =
  {
    [UnavailabilityReason.ANNUAL_LEAVE]: 'annualLeave',
    [UnavailabilityReason.OFFICIAL_BUSINESS]: 'officialBusiness',
    [UnavailabilityReason.SICK_LEAVE]: 'sickLeave',
    [UnavailabilityReason.TRAINING]: 'training'
  } as const;
