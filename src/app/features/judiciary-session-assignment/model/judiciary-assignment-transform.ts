import type { JudiciaryTypeGroup, JudiciaryTypePayload } from '@cpp/reference-data';
import type { JudiciarySelectionValue } from '../../../shared';
import type { JudiciaryAssignmentItemDTO } from './judiciary-assignment-api.model';

const PAYLOAD_TO_API: Partial<Record<JudiciaryTypePayload, JudiciaryTypeGroup>> = {
  Judge: 'CIRCUIT_JUDGE',
  'District Judge': 'DISTRICT_JUDGE',
  'Deputy District Judge': 'DEPUTY_DISTRICT_JUDGE',
  Recorder: 'RECORDER',
  Magistrate: 'MAGISTRATE'
};

export function transformJudiciarySelectionToPayload(
  value: JudiciarySelectionValue
): JudiciaryAssignmentItemDTO[] {
  if (!value) {
    return [];
  }
  return Object.entries(value).flatMap<JudiciaryAssignmentItemDTO>(([key, judiciary]) => {
    const judiciaryType = PAYLOAD_TO_API[key as JudiciaryTypePayload];
    if (!judiciaryType) return [];
    if (Array.isArray(judiciary)) {
      return judiciary.map(({ id }, index) => ({
        judicialId: id,
        judicialRoleType: { judiciaryType },
        isBenchChairman: judiciaryType === 'MAGISTRATE' && index === 0,
        isDeputy: judiciaryType === 'MAGISTRATE' && index > 0
      }));
    }

    return [
      {
        judicialId: judiciary.id,
        judicialRoleType: { judiciaryType },
        isDeputy: false,
        isBenchChairman: judiciaryType === 'MAGISTRATE'
      }
    ];
  });
}
