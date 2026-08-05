import { formatDate as angularFormatDate } from '@angular/common';
import { DayOfWeek } from '../model/days';
const UNIVERSAL_DATE_FORMAT = /\d{4}-\d{2}-\d{2}/;
export const DAYS_TO_NEXT_SUNDAY = 6;
export const ONE_YEAR_IN_WEEKS = 52;
export const ONE_YEAR_IN_MONTHS = 12;
export const TWO_YEARS_IN_WEEKS = 104;
export const TWO_YEARS_IN_MONTHS = 24;
export const DAYS_PER_WEEK = 7;

export const addDaysToDate = (date: Date, days: number): Date => {
  const resultDate = normalizeDate(date);
  resultDate.setDate(resultDate.getDate() + days);
  return resultDate;
};

export const getDisplayText = (startDate: Date, endDate: Date) =>
  startDate && endDate
    ? `From ${formatDate(startDate, 'd MMM yyyy')} to ${formatDate(endDate, 'd MMM yyyy')}`
    : '';

export const isDateNotMonday = (date: Date): boolean => {
  return date.getDay() !== 1;
};

export const isDateNotFirstOfMonth = (date: Date): boolean => {
  const today = new Date();
  const todayNormalized = normalizeDate(today);
  const dateNormalized = normalizeDate(date);

  // Check if date is the 1st of the month
  const isFirstOfMonth = dateNormalized.getDate() === 1;

  if (!isFirstOfMonth) {
    return true; // Disable if not 1st of month
  }

  // If today is the 1st, allow current month
  const isTodayFirstOfMonth = todayNormalized.getDate() === 1;
  const isSameMonth = dateNormalized.getMonth() === todayNormalized.getMonth();
  const isSameYear = dateNormalized.getFullYear() === todayNormalized.getFullYear();

  if (isTodayFirstOfMonth && isSameMonth && isSameYear) {
    return false; // Allow current month if today is 1st
  }

  // Otherwise, only allow future months (not past)
  return dateNormalized < todayNormalized;
};

/*
  This method accepts targetDate as either a string or a Date object to handle different input types.
  E.g., pdk-date-picker-input: isDateHighlighted returns a Date, while isDateSelected returns a string.
*/
export const isDateBetweenRange = (date: Date, targetDate: string | Date): boolean => {
  const normalizedDate = normalizeDate(date);
  const startDate = targetDate instanceof Date ? normalizeDate(targetDate) : new Date(targetDate);

  // DD-33468 - Business wants to unhighlight the final day of the week date range "-1"
  const endDate = addDaysToDate(startDate, DAYS_PER_WEEK - 1);

  return normalizedDate >= startDate && normalizedDate <= endDate;
};

export const getInsetLabel = (date: Date) => {
  const day = formatDate(date, 'EEEE');
  return day ? `Selected day: ${day}` : '';
};

export const getSundaysAfterStartDate = (startDate: string, numWeeks: number): Date[] => {
  const sundays: Date[] = [];
  // startDate is always a Monday so that week's sunday would be startDate + 6 days
  const currentSunday = addDaysToDate(new Date(startDate), DAYS_TO_NEXT_SUNDAY);
  // Propagate pattern 2 years (104 weeks) in the calendar view
  for (let i = 0; i <= TWO_YEARS_IN_WEEKS; i += numWeeks) {
    sundays.push(addDaysToDate(currentSunday, i * DAYS_PER_WEEK));
  }
  return sundays;
};

export const parseDateToString = (date: Date | string): string => {
  if (typeof date === 'string') return date;
  return formatDate(date, 'yyyy-MM-dd');
};

export const parseStringToDate = (dateString?: string): Date | null => {
  return dateString ? new Date(dateString) : null;
};

// Normalize the date to avoid timezone issues
export const normalizeDate = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const parseDateToLocaleString = (date: Date | string) => {
  if (typeof date === 'string' || date instanceof String) {
    date = new Date(date);
  }
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getDaysOfWeek = (values: DayOfWeek[]): (keyof typeof DayOfWeek)[] => {
  return values.map((value) => {
    const key = (Object.keys(DayOfWeek) as Array<keyof typeof DayOfWeek>).find(
      (k) => DayOfWeek[k] === value
    );
    if (!key) {
      throw new Error(`DayOfWeek value ${value} not found in enum`);
    }
    return key;
  });
};

export const isPastDate = (date: string): boolean => {
  const sessionDate = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return sessionDate < yesterday;
};

export const getYesterday = (): Date => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return yesterday;
};

/**
 * Converts a Date object to a string in the specified format.
 * Default format is 'yyyy-MM-dd' which is used by PDK date validators (minDate, maxDate).
 * @param date - The Date object to convert
 * @param format - Optional format string (defaults to 'yyyy-MM-dd')
 * @returns A string in the specified format
 */
export const formatDate = (date: Date, format: string = 'yyyy-MM-dd'): string | null => {
  if (isNaN(date.getTime())) {
    return null;
  }
  return angularFormatDate(date, format, 'en-GB');
};

export const inValidFormat = (value: string | null): boolean => {
  if (!value) {
    return false;
  }
  return UNIVERSAL_DATE_FORMAT.test(value);
};
