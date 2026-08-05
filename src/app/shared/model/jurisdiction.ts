export enum JurisdictionType {
  MAGISTRATES = 'MAGISTRATES',
  CROWN = 'CROWN'
}

export type JurisdictionTypeUnion = keyof typeof JurisdictionType;
