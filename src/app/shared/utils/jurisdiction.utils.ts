import { OrganisationUnit } from '@cpp/reference-data';
import { JurisdictionType } from '../model/jurisdiction';

export type JurisdictionCode = 'B' | 'C';

const JURISDICTION_MAP: Record<JurisdictionCode, JurisdictionType> = {
  B: JurisdictionType.MAGISTRATES,
  C: JurisdictionType.CROWN
} as const;

const JURISDICTION_CODE_MAP: Record<JurisdictionType, JurisdictionCode> = {
  [JurisdictionType.MAGISTRATES]: 'B',
  [JurisdictionType.CROWN]: 'C'
} as const;

export function getJurisdiction(courtCentre: OrganisationUnit | null): JurisdictionType | null {
  if (!courtCentre?.oucodeL1Code) {
    return null;
  }

  return JURISDICTION_MAP[courtCentre.oucodeL1Code as JurisdictionCode] || null;
}

export function isMagistratesCourt(courtCentre: OrganisationUnit | null): boolean {
  return getJurisdiction(courtCentre) === JurisdictionType.MAGISTRATES;
}

export function isCrownCourt(courtCentre: OrganisationUnit | null): boolean {
  return getJurisdiction(courtCentre) === JurisdictionType.CROWN;
}

export function isCrownJurisdiction(jurisdiction: JurisdictionType | null): boolean {
  return jurisdiction === JurisdictionType.CROWN;
}

export function getJurisdictionCode(jurisdictionType: JurisdictionType): JurisdictionCode {
  return JURISDICTION_CODE_MAP[jurisdictionType];
}

export function getJurisdictionTypeFromCode(code: string): JurisdictionType | null {
  return JURISDICTION_MAP[code as JurisdictionCode] || null;
}
