import { filterExists, getJudiciaryType, getJudiciaryTypes } from '../core.utils';
import { ExtendedJudicialMember } from '../../model';

describe('core.utils', () => {
  describe('filterExists', () => {
    it('should omit null and undefined properties', () => {
      expect.assertions(1);
      expect(
        filterExists({
          a: 1,
          b: null,
          c: undefined,
          d: 'x'
        })
      ).toEqual({ a: 1, d: 'x' });
    });
  });

  describe('getJudiciaryType', () => {
    it('should return null when judiciary is null', () => {
      expect.assertions(1);
      expect(getJudiciaryType(null)).toBeNull();
    });

    it('should map Circuit Judge to payload', () => {
      expect.assertions(1);
      const m = {
        judiciaryType: 'Circuit Judge'
      } as ExtendedJudicialMember;
      expect(getJudiciaryType(m)).toBe('Judge');
    });
  });

  describe('getJudiciaryTypes', () => {
    it('should return null for null judiciaries', () => {
      expect.assertions(1);
      expect(getJudiciaryTypes(null)).toBeNull();
    });

    it('should map each judiciary type', () => {
      expect.assertions(1);
      const list = [
        { judiciaryType: 'Circuit Judge' },
        { judiciaryType: 'Circuit Judge' }
      ] as ExtendedJudicialMember[];
      expect(getJudiciaryTypes(list)).toEqual(['Judge', 'Judge']);
    });
  });
});
