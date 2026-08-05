import {
  getJurisdiction,
  isMagistratesCourt,
  isCrownCourt,
  getJurisdictionCode,
  getJurisdictionTypeFromCode,
  isCrownJurisdiction
} from './jurisdiction.utils';
import { mockMagistratesCourtCentre, mockCrownCourt } from '../mocks/mocks';
import { JurisdictionType } from '../model/jurisdiction';

describe('Jurisdiction Utils', () => {
  describe('getJurisdiction', () => {
    it('should return MAGISTRATES for magistrates court', () => {
      const result = getJurisdiction(mockMagistratesCourtCentre);
      expect(result).toBe(JurisdictionType.MAGISTRATES);
    });

    it('should return CROWN for crown court', () => {
      const result = getJurisdiction(mockCrownCourt);
      expect(result).toBe(JurisdictionType.CROWN);
    });

    it('should return null for null court centre', () => {
      const result = getJurisdiction(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined court centre', () => {
      const result = getJurisdiction(undefined);
      expect(result).toBeNull();
    });
  });

  describe('isMagistratesCourt', () => {
    it('should return true for Magistrates court', () => {
      const result = isMagistratesCourt(mockMagistratesCourtCentre);
      expect(result).toBe(true);
    });

    it('should return false for Crown court', () => {
      const result = isMagistratesCourt(mockCrownCourt);
      expect(result).toBe(false);
    });

    it('should return false for null court', () => {
      const result = isMagistratesCourt(null);
      expect(result).toBe(false);
    });
  });

  describe('isCrownCourt', () => {
    it('should return true for Crown court', () => {
      const result = isCrownCourt(mockCrownCourt);
      expect(result).toBe(true);
    });

    it('should return false for Magistrates court', () => {
      const result = isCrownCourt(mockMagistratesCourtCentre);
      expect(result).toBe(false);
    });

    it('should return false for null court', () => {
      const result = isCrownCourt(null);
      expect(result).toBe(false);
    });
  });

  describe('getJurisdictionCode', () => {
    it('should return "B" for MAGISTRATES jurisdiction', () => {
      const result = getJurisdictionCode(JurisdictionType.MAGISTRATES);
      expect(result).toBe('B');
    });

    it('should return "C" for CROWN jurisdiction', () => {
      const result = getJurisdictionCode(JurisdictionType.CROWN);
      expect(result).toBe('C');
    });
  });

  describe('getJurisdictionTypeFromCode', () => {
    it('should return MAGISTRATES for "B" code', () => {
      const result = getJurisdictionTypeFromCode('B');
      expect(result).toBe(JurisdictionType.MAGISTRATES);
    });

    it('should return CROWN for "C" code', () => {
      const result = getJurisdictionTypeFromCode('C');
      expect(result).toBe(JurisdictionType.CROWN);
    });
  });

  describe('isCrownJurisdiction', () => {
    it('should return true for CROWN jurisdiction', () => {
      const result = isCrownJurisdiction(JurisdictionType.CROWN);
      expect(result).toBe(true);
    });

    it('should return false for MAGISTRATES jurisdiction', () => {
      const result = isCrownJurisdiction(JurisdictionType.MAGISTRATES);
      expect(result).toBe(false);
    });

    it('should return false for null jurisdiction', () => {
      const result = isCrownJurisdiction(null);
      expect(result).toBe(false);
    });
  });
});
