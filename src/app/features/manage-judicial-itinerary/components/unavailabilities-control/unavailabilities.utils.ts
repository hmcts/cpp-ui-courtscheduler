import { Unavailability } from '../../model/unavailability.interface';
import { UNAVAILABILITY_REASONS_MAP } from '../../model/unavailability.interface';

export type OverlappingDatesError = {
  firstReason: string;
  secondReason: string;
};

export function validateUnavailabilityOverlaps(
  unavailabilities: Unavailability[]
): Record<'overlappingDates', OverlappingDatesError> | null {
  if (!unavailabilities || unavailabilities.length === 0) {
    return null;
  }

  for (let i = 0; i < unavailabilities.length; i++) {
    for (let j = i + 1; j < unavailabilities.length; j++) {
      const range = unavailabilities[i];
      const rangeToCompare = unavailabilities[j];

      const rangeStart = new Date(range.startDate);
      const rangeEnd = new Date(range.endDate);
      const rangeToCompareStart = new Date(rangeToCompare.startDate);
      const rangeToCompareEnd = new Date(rangeToCompare.endDate);

      // Check if they overlap each other
      if (rangeStart <= rangeToCompareEnd && rangeEnd >= rangeToCompareStart) {
        return {
          overlappingDates: {
            firstReason: UNAVAILABILITY_REASONS_MAP[range.reason],
            secondReason: UNAVAILABILITY_REASONS_MAP[rangeToCompare.reason]
          }
        };
      }
    }
  }

  return null;
}

export function addUnavailabilityEntry(
  newEntry: Unavailability,
  existingUnavailabilities: Unavailability[]
): Unavailability[] {
  let entry: Unavailability | null = { ...newEntry };
  const toRemove: Unavailability[] = [];

  for (const existing of existingUnavailabilities) {
    if (!entry) break;

    const existingStart = new Date(existing.startDate);
    const existingEnd = new Date(existing.endDate);
    const entryStart = new Date(entry.startDate);
    const entryEnd = new Date(entry.endDate);

    // Entry completely within existing or is exact match so do not add
    if (
      (entryStart >= existingStart && entryEnd <= existingEnd) || // Completely within
      (existing.startDate === entry.startDate && existing.endDate === entry.endDate) // Exact match
    ) {
      entry = null;
      break;
    }

    // If Entry is a superset of existing where existing is a range or a single day, remove existing
    if (
      (entryStart <= existingStart && entryEnd >= existingEnd) ||
      (existing.startDate === existing.endDate &&
        entryStart <= existingStart &&
        entryEnd >= existingEnd)
    ) {
      toRemove.push(existing);
      continue;
    }

    // Entry starts before existing start date but ends before existing end date, merge with existing
    if (entryStart < existingStart && entryEnd >= existingStart && entryEnd <= existingEnd) {
      entry.endDate = existing.endDate;
      toRemove.push(existing);
    }

    // Entry starts within existing date range and ends after - merge with existing
    if (entryStart >= existingStart && entryStart <= existingEnd && entryEnd > existingEnd) {
      entry.startDate = existing.startDate;
      toRemove.push(existing);
    }
  }

  const result = existingUnavailabilities.filter((e) => !toRemove.includes(e));
  if (entry) {
    result.push(entry);
  }
  return result;
}
