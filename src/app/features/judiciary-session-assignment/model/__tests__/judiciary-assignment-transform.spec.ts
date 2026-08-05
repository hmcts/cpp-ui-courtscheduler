import { transformJudiciarySelectionToPayload } from '../judiciary-assignment-transform';
import type { JudiciarySelectionValue } from '../../../../shared';
import type { ExtendedJudicialMember } from '../../../../shared';

describe('transformJudiciarySelectionToPayload', () => {
  it('should return empty array for nullish value', () => {
    expect.assertions(2);
    expect(transformJudiciarySelectionToPayload(null as never)).toEqual([]);
    expect(transformJudiciarySelectionToPayload(undefined as never)).toEqual([]);
  });

  it('should map single Judge selection', () => {
    expect.assertions(1);
    const judiciary = { id: 'j1' } as ExtendedJudicialMember;
    const value: JudiciarySelectionValue = { Judge: judiciary };
    expect(transformJudiciarySelectionToPayload(value)).toEqual([
      {
        judicialId: 'j1',
        judicialRoleType: { judiciaryType: 'CIRCUIT_JUDGE' },
        isDeputy: false,
        isBenchChairman: false
      }
    ]);
  });

  it('should map Magistrate array entries', () => {
    expect.assertions(1);
    const m1 = { id: 'm1' } as ExtendedJudicialMember;
    const m2 = { id: 'm2' } as ExtendedJudicialMember;
    const value: JudiciarySelectionValue = { Magistrate: [m1, m2] };
    expect(transformJudiciarySelectionToPayload(value)).toEqual([
      {
        judicialId: 'm1',
        judicialRoleType: { judiciaryType: 'MAGISTRATE' },
        isBenchChairman: true,
        isDeputy: false
      },
      {
        judicialId: 'm2',
        judicialRoleType: { judiciaryType: 'MAGISTRATE' },
        isBenchChairman: false,
        isDeputy: true
      }
    ]);
  });

  it('should skip unknown payload keys', () => {
    expect.assertions(1);
    const value = { Unknown: { id: 'x' } } as unknown as JudiciarySelectionValue;
    expect(transformJudiciarySelectionToPayload(value)).toEqual([]);
  });
});
