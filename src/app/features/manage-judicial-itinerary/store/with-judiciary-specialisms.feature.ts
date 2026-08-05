import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Signal } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStoreFeature,
  type,
  withComputed,
  withMethods,
  withState
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, of, pipe, switchMap } from 'rxjs';
import { ExtendedJudicialMember } from '../../../shared/model';
import { Specialism } from '@cpp/reference-data';
import { JudicialItineraryService } from '../services/judicial-itinerary.service';
import { JudiciarySelectionState } from '../../../shared/signal-store';

interface BaseDependencyState extends JudiciarySelectionState {}
interface BaseDependencyProps {
  firstSelectedJudiciary: Signal<ExtendedJudicialMember | null>;
}
interface BaseDependencyMethods extends Record<string, Function> {
  setSelectedJudiciary: (judiciary: ExtendedJudicialMember[]) => void;
  navigateByUrlTo: (url: string) => void;
  handleError?: (error: HttpErrorResponse) => void;
}

export interface JudiciarySpecialismsState {
  draftSpecialisms: Specialism[];
  specialismAddedSuccess: boolean;
}

const initialState: JudiciarySpecialismsState = {
  draftSpecialisms: [],
  specialismAddedSuccess: false
};

// we use an unused generic parameter because the inputs are static
//see : https://ngrx.io/guide/signals/signal-store/custom-store-features#known-typescript-issues
export function withJudiciarySpecialisms<_>() {
  return signalStoreFeature(
    {
      state: type<BaseDependencyState>(),
      props: type<BaseDependencyProps>(),
      methods: type<BaseDependencyMethods>()
    },
    withState(initialState),
    withComputed(({ firstSelectedJudiciary, draftSpecialisms }) => ({
      aggregatedSelectedSpecialisms: computed(() => {
        const existing = firstSelectedJudiciary()?.specialisms ?? [];
        const draft = draftSpecialisms();
        return [...existing, ...draft];
      })
    })),
    withMethods((store, service = inject(JudicialItineraryService)) => ({
      setDraftSpecialisms: (specialisms: Specialism[]) => {
        patchState(store, { draftSpecialisms: specialisms });
      },
      clearSpecialismAddedSuccess: () => {
        patchState(store, { specialismAddedSuccess: false });
      },
      addSpecialisms: rxMethod<{ referrer?: string }>(
        pipe(
          switchMap(({ referrer }): Observable<unknown> => {
            const selectedJudiciary = store.firstSelectedJudiciary();
            if (!selectedJudiciary?.id) {
              return of(null);
            }

            const specialisms = store.aggregatedSelectedSpecialisms();

            return service.addSpecialisms(selectedJudiciary.id, specialisms).pipe(
              tapResponse({
                next: ({ specialisms: updatedSpecialisms }) => {
                  const updatedJudiciary: ExtendedJudicialMember = {
                    ...selectedJudiciary,
                    specialisms: updatedSpecialisms
                  };
                  store.setSelectedJudiciary([updatedJudiciary]);

                  patchState(store, { draftSpecialisms: [] });

                  patchState(store, { specialismAddedSuccess: true });

                  if (referrer) {
                    store.navigateByUrlTo(referrer);
                  }
                },
                error: (err: HttpErrorResponse) => {
                  store.handleError(err);
                }
              })
            );
          })
        )
      ),
      resetJudiciarySpecialismsState: () => {
        patchState(store, initialState);
      }
    }))
  );
}
