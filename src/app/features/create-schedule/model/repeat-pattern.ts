export enum FrequencyType {
  ONCE = 'ONCE',
  EVERY_WEEK = 'EVERY_WEEK',
  EVERY_MONTH = 'EVERY_MONTH'
}

export type FrequencyTypeUnion = keyof typeof FrequencyType;

export interface RepeatPattern {
  startDate: string;
  frequency: FrequencyTypeUnion;
  repeatFor: number;
  endDate: string;
  index?: string;
  repeatDay?: string;
}

export enum IntervalType {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export type IntervalTypeUnion = keyof typeof IntervalType;
