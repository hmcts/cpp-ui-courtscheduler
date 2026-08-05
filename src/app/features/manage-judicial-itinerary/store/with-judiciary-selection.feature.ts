import { signalStoreFeature, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { JudiciaryWithSpecialisms } from '../model/judicial-itinerary.interface';
import {
  judiciaryTypeGroupToJudiciaryTypePayload,
  mapRefDataJudiciaryToJudiciaryType
} from '@cpp/reference-data';

export interface JudiciarySelectionState {
  selectedJudiciary: JudiciaryWithSpecialisms | null;
}

const initialState: JudiciarySelectionState = {
  selectedJudiciary: null
};

export function withJudiciarySelection() {
  return signalStoreFeature(
    withState<JudiciarySelectionState>(initialState),
    withComputed(({ selectedJudiciary }) => ({
      selectedType: computed(() => {
        const judiciary = selectedJudiciary();
        if (!judiciary) {
          return null;
        }
        const judiciaryGroup = mapRefDataJudiciaryToJudiciaryType(judiciary.judiciaryType);
        return judiciaryTypeGroupToJudiciaryTypePayload(judiciaryGroup);
      }),
      selectedJudiciarySpecialisms: computed(() => {
        return selectedJudiciary()?.specialisms ?? [];
      })
    })),
    withMethods((store) => ({
      setSelectedJudiciary: (judiciary: JudiciaryWithSpecialisms | null) => {
        patchState(store, { selectedJudiciary: judiciary });
      },
      clearJudiciarySelection: () => {
        patchState(store, initialState);
      }
    }))
  );
}
