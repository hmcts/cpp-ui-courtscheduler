import { JudiciaryTypeGroup } from '@cpp/reference-data';
export interface JudicialRoleType {
  judiciaryType: JudiciaryTypeGroup;
}

export interface JudiciaryAssignmentItemDTO {
  judicialId: string;
  judicialRoleType: JudicialRoleType;
  isDeputy?: boolean;
  isBenchChairman?: boolean;
}

export interface JudiciaryAssignmentPayload {
  courtScheduleIds: string[];
  judiciary: JudiciaryAssignmentItemDTO[];
}
