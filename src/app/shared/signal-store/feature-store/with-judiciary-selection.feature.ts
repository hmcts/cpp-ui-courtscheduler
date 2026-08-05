import { signalStoreFeature, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { JudiciaryTypePayload } from '@cpp/reference-data';
import { ExtendedJudicialMember, JudiciarySelectionValue } from '../../model';
import { getJudiciaryType, getJudiciaryTypes } from '../../utils/core.utils';

export interface JudiciarySelectionState {
  selectedJudiciaries: ExtendedJudicialMember[] | null;
  selectedJudiciaryTypes: JudiciaryTypePayload[] | null;
}

const initialState: JudiciarySelectionState = {
  selectedJudiciaries: null,
  selectedJudiciaryTypes: null
};

export function withJudiciarySelection() {
  return signalStoreFeature(
    withState<JudiciarySelectionState>(initialState),
    withComputed(({ selectedJudiciaries, selectedJudiciaryTypes }) => ({
      firstSelectedJudiciary: computed(() => {
        const judiciaries = selectedJudiciaries();
        if (!judiciaries || judiciaries.length === 0) {
          return null;
        }
        return judiciaries[0];
      }),
      firstSelectedJudiciaryType: computed(() => {
        const types = selectedJudiciaryTypes();
        return (types ?? [])[0] ?? null;
      }),
      selectedJudiciaryByTypeMap: computed(() => {
        const judiciaries = selectedJudiciaries();
        if (!judiciaries || judiciaries.length === 0) {
          return null;
        }
        return judiciaries.reduce(
          (selectedMap: JudiciarySelectionValue, judiciary: ExtendedJudicialMember) => {
            const judiciaryType = getJudiciaryType(judiciary);
            if (judiciaryType === '') {
              return selectedMap;
            }
            if (judiciaryType === 'Magistrate') {
              selectedMap.Magistrate = [...(selectedMap.Magistrate ?? []), judiciary];
            } else {
              selectedMap[judiciaryType] = judiciary;
            }
            return selectedMap;
          },
          {} as JudiciarySelectionValue
        );
      })
    })),
    withMethods((store) => ({
      setSelectedJudiciary: (
        judiciary: ExtendedJudicialMember | ExtendedJudicialMember[] | null
      ) => {
        if (judiciary === null) {
          patchState(store, {
            selectedJudiciaries: null,
            selectedJudiciaryTypes: null
          });
          return;
        }
        const judiciaries = Array.isArray(judiciary) ? judiciary : [judiciary];
        patchState(store, {
          selectedJudiciaries: judiciaries,
          selectedJudiciaryTypes: getJudiciaryTypes(judiciaries)
        });
      },
      clearJudiciarySelection: () => {
        patchState(store, initialState);
      }
    }))
  );
}
