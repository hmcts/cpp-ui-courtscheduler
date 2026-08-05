import { validateUnavailabilityOverlaps, addUnavailabilityEntry } from '../unavailabilities.utils';
import { Unavailability, UnavailabilityReason } from '../../../model/unavailability.interface';

describe('unavailabilities.utils', () => {
  describe('validateUnavailabilityOverlaps', () => {
    it('should return null when unavailabilities is null', () => {
      expect.assertions(1);
      const result = validateUnavailabilityOverlaps(null as any);
      expect(result).toBeNull();
    });

    it('should return null when unavailabilities is undefined', () => {
      expect.assertions(1);
      const result = validateUnavailabilityOverlaps(undefined as any);
      expect(result).toBeNull();
    });

    it('should return null when unavailabilities is empty array', () => {
      expect.assertions(1);
      const result = validateUnavailabilityOverlaps([]);
      expect(result).toBeNull();
    });

    it('should return null when there are no overlaps', () => {
      expect.assertions(1);
      const unavailabilities: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-05',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        },
        {
          startDate: '2026-01-10',
          endDate: '2026-01-15',
          reason: UnavailabilityReason.SICK_LEAVE
        }
      ];
      const result = validateUnavailabilityOverlaps(unavailabilities);
      expect(result).toBeNull();
    });

    it('should return error when two unavailabilities overlap', () => {
      expect.assertions(3);
      const unavailabilities: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        },
        {
          startDate: '2026-01-05',
          endDate: '2026-01-15',
          reason: UnavailabilityReason.SICK_LEAVE
        }
      ];
      const result = validateUnavailabilityOverlaps(unavailabilities);
      expect(result).not.toBeNull();
      expect(result?.overlappingDates.firstReason).toBe('Annual leave');
      expect(result?.overlappingDates.secondReason).toBe('Sick leave');
    });

    it('should return error when unavailabilities have same start date', () => {
      expect.assertions(1);
      const unavailabilities: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        },
        {
          startDate: '2026-01-01',
          endDate: '2026-01-15',
          reason: UnavailabilityReason.SICK_LEAVE
        }
      ];
      const result = validateUnavailabilityOverlaps(unavailabilities);
      expect(result).not.toBeNull();
    });

    it('should return error when unavailabilities have same end date', () => {
      expect.assertions(1);
      const unavailabilities: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        },
        {
          startDate: '2026-01-05',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.SICK_LEAVE
        }
      ];
      const result = validateUnavailabilityOverlaps(unavailabilities);
      expect(result).not.toBeNull();
    });

    it('should return error when one unavailability is completely within another', () => {
      expect.assertions(1);
      const unavailabilities: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-20',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        },
        {
          startDate: '2026-01-05',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.SICK_LEAVE
        }
      ];
      const result = validateUnavailabilityOverlaps(unavailabilities);
      expect(result).not.toBeNull();
    });

    it('should return error when one unavailability starts before and ends within another', () => {
      expect.assertions(1);
      const unavailabilities: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        },
        {
          startDate: '2026-01-05',
          endDate: '2026-01-20',
          reason: UnavailabilityReason.SICK_LEAVE
        }
      ];
      const result = validateUnavailabilityOverlaps(unavailabilities);
      expect(result).not.toBeNull();
    });

    it('should return error when one unavailability starts within and ends after another', () => {
      expect.assertions(1);
      const unavailabilities: Unavailability[] = [
        {
          startDate: '2026-01-05',
          endDate: '2026-01-15',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        },
        {
          startDate: '2026-01-01',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.SICK_LEAVE
        }
      ];
      const result = validateUnavailabilityOverlaps(unavailabilities);
      expect(result).not.toBeNull();
    });

    it('should return error when checking multiple unavailabilities and first two overlap', () => {
      expect.assertions(1);
      const unavailabilities: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        },
        {
          startDate: '2026-01-05',
          endDate: '2026-01-15',
          reason: UnavailabilityReason.SICK_LEAVE
        },
        {
          startDate: '2026-01-20',
          endDate: '2026-01-25',
          reason: UnavailabilityReason.TRAINING
        }
      ];
      const result = validateUnavailabilityOverlaps(unavailabilities);
      expect(result).not.toBeNull();
    });
  });

  describe('addUnavailabilityEntry', () => {
    it('should add entry when existing array is empty', () => {
      expect.assertions(1);
      const newEntry: Unavailability = {
        startDate: '2026-01-01',
        endDate: '2026-01-05',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const result = addUnavailabilityEntry(newEntry, []);
      expect(result).toEqual([newEntry]);
    });

    it('should not add entry when it is exact match of existing', () => {
      expect.assertions(1);
      const newEntry: Unavailability = {
        startDate: '2026-01-01',
        endDate: '2026-01-05',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const existing: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-05',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ];
      const result = addUnavailabilityEntry(newEntry, existing);
      expect(result).toEqual(existing);
    });

    it('should not add entry when it is completely within existing', () => {
      expect.assertions(1);
      const newEntry: Unavailability = {
        startDate: '2026-01-03',
        endDate: '2026-01-04',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const existing: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-05',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ];
      const result = addUnavailabilityEntry(newEntry, existing);
      expect(result).toEqual(existing);
    });

    it('should not add entry when it starts at existing start and ends within existing', () => {
      expect.assertions(1);
      const newEntry: Unavailability = {
        startDate: '2026-01-01',
        endDate: '2026-01-03',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const existing: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-05',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ];
      const result = addUnavailabilityEntry(newEntry, existing);
      expect(result).toEqual(existing);
    });

    it('should not add entry when it starts within existing and ends at existing end', () => {
      expect.assertions(1);
      const newEntry: Unavailability = {
        startDate: '2026-01-03',
        endDate: '2026-01-05',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const existing: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-05',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ];
      const result = addUnavailabilityEntry(newEntry, existing);
      expect(result).toEqual(existing);
    });

    it('should replace existing when new entry is superset of existing range', () => {
      expect.assertions(2);
      const newEntry: Unavailability = {
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const existing: Unavailability[] = [
        {
          startDate: '2026-01-03',
          endDate: '2026-01-05',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ];
      const result = addUnavailabilityEntry(newEntry, existing);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(newEntry);
    });

    it('should replace existing when new entry is superset of single-day existing', () => {
      expect.assertions(2);
      const newEntry: Unavailability = {
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const existing: Unavailability[] = [
        {
          startDate: '2026-01-05',
          endDate: '2026-01-05',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ];
      const result = addUnavailabilityEntry(newEntry, existing);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(newEntry);
    });

    it('should merge when new entry starts before existing and ends within existing', () => {
      expect.assertions(2);
      const newEntry: Unavailability = {
        startDate: '2026-01-01',
        endDate: '2026-01-05',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const existing: Unavailability[] = [
        {
          startDate: '2026-01-03',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ];
      const result = addUnavailabilityEntry(newEntry, existing);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      });
    });

    it('should merge when new entry starts within existing and ends after existing', () => {
      expect.assertions(2);
      const newEntry: Unavailability = {
        startDate: '2026-01-05',
        endDate: '2026-01-15',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const existing: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ];
      const result = addUnavailabilityEntry(newEntry, existing);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({
        startDate: '2026-01-01',
        endDate: '2026-01-15',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      });
    });

    it('should handle multiple existing entries and merge with first overlapping', () => {
      expect.assertions(3);
      const newEntry: Unavailability = {
        startDate: '2026-01-05',
        endDate: '2026-01-15',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const existing: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        },
        {
          startDate: '2026-01-20',
          endDate: '2026-01-25',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ];
      const result = addUnavailabilityEntry(newEntry, existing);
      expect(result.length).toBe(2);
      const mergedEntry = result.find((e) => e.startDate === '2026-01-01');
      expect(mergedEntry).toBeDefined();
      expect(mergedEntry?.endDate).toBe('2026-01-15');
    });

    it('should handle new entry that overlaps with multiple existing entries', () => {
      expect.assertions(2);
      const newEntry: Unavailability = {
        startDate: '2026-01-01',
        endDate: '2026-01-20',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const existing: Unavailability[] = [
        {
          startDate: '2026-01-05',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        },
        {
          startDate: '2026-01-12',
          endDate: '2026-01-15',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ];
      const result = addUnavailabilityEntry(newEntry, existing);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(newEntry);
    });

    it('should break early when entry is set to null', () => {
      expect.assertions(1);
      const newEntry: Unavailability = {
        startDate: '2026-01-03',
        endDate: '2026-01-04',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const existing: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-05',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        },
        {
          startDate: '2026-01-10',
          endDate: '2026-01-15',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ];
      const result = addUnavailabilityEntry(newEntry, existing);
      expect(result.length).toBe(2);
    });

    it('should handle new entry that starts exactly at existing start and ends after', () => {
      expect.assertions(2);
      const newEntry: Unavailability = {
        startDate: '2026-01-01',
        endDate: '2026-01-15',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const existing: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ];
      const result = addUnavailabilityEntry(newEntry, existing);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({
        startDate: '2026-01-01',
        endDate: '2026-01-15',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      });
    });

    it('should handle new entry that starts within existing and ends exactly at existing end', () => {
      expect.assertions(1);
      const newEntry: Unavailability = {
        startDate: '2026-01-05',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const existing: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ];
      const result = addUnavailabilityEntry(newEntry, existing);
      expect(result).toEqual(existing);
    });

    it('should handle new entry that starts exactly at existing end', () => {
      expect.assertions(1);
      const newEntry: Unavailability = {
        startDate: '2026-01-10',
        endDate: '2026-01-15',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const existing: Unavailability[] = [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ];
      const result = addUnavailabilityEntry(newEntry, existing);
      expect(result.length).toBe(1);
    });

    it('should handle new entry that ends exactly at existing start', () => {
      expect.assertions(1);
      const newEntry: Unavailability = {
        startDate: '2026-01-01',
        endDate: '2026-01-05',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      };
      const existing: Unavailability[] = [
        {
          startDate: '2026-01-05',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ];
      const result = addUnavailabilityEntry(newEntry, existing);
      expect(result.length).toBe(1);
    });
  });
});
