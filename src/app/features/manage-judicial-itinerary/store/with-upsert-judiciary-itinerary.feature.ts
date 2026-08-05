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
import { pipe, switchMap } from 'rxjs';
import { DayOfWeek } from '../../../shared/model';
import { getDaysOfWeek } from '../../../shared/utils/date-utils';
import { DraftItinerary, Itinerary } from '../model/judicial-itinerary.interface';
import { ExtendedJudicialMember } from '../../../shared/model';
import { JudicialItineraryService } from '../services/judicial-itinerary.service';
import { ItinerarySearchParams } from './manage-judiciary-itinerary.store.interfaces';

export interface UpsertJudiciaryItineraryState {
  draftItinerary: DraftItinerary;
}

interface BaseDependencyState {
  searchParams: ItinerarySearchParams;
  selectedItinerary: Itinerary | null;
}

interface BaseDependencyProps {
  firstSelectedJudiciary: Signal<ExtendedJudicialMember | null>;
}

interface BaseDependencyMethods extends Record<string, Function> {
  handleError?: (error: HttpErrorResponse) => void;
  clearJudiciarySelection: () => void;
  setSelectedItinerary: (itinerary: Itinerary | null) => void;
  clearServerSubmissionError: () => void;
}

const initialState: UpsertJudiciaryItineraryState = {
  draftItinerary: {
    availability: {
      startDate: null,
      endDate: null
    },
    sittingDays: [],
    session: null,
    unavailabilities: []
  }
};

// we use an unused generic parameter because the inputs are static
//see : https://ngrx.io/guide/signals/signal-store/custom-store-features#known-typescript-issues
export function withUpsertJudiciaryItinerary<_>() {
  return signalStoreFeature(
    {
      state: type<BaseDependencyState>(),
      props: type<BaseDependencyProps>(),
      methods: type<BaseDependencyMethods>()
    },
    withState<UpsertJudiciaryItineraryState>(initialState),
    withComputed(({ draftItinerary, firstSelectedJudiciary, searchParams, selectedItinerary }) => ({
      normalisedSittingDays: computed(() => {
        const { sittingDays } = draftItinerary();
        return sittingDays.length > 0
          ? getDaysOfWeek(sittingDays)
          : ([
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday'
            ] as (keyof typeof DayOfWeek)[]);
      }),

      editItinerary: computed(() => {
        const itinerary = selectedItinerary();
        const judiciary = firstSelectedJudiciary();
        if (!itinerary || !judiciary) {
          return null;
        }
        return {
          availability: {
            startDate: itinerary.startDate,
            endDate: itinerary.endDate
          },
          sittingDays: itinerary.repeatDays.map((day) => DayOfWeek[day as keyof typeof DayOfWeek]),
          session: itinerary.sessionType,
          specialisms: itinerary.judiciaryMember?.specialisms ?? [],
          unavailabilities: itinerary.unavailabilities ?? []
        };
      }),

      upsertPayload: computed(() => {
        const judiciary = firstSelectedJudiciary();
        const courtCentre = searchParams()?.courtCentre;
        const { id: ruleId, courtHouseId } = selectedItinerary() ?? {
          id: null,
          courtHouseId: courtCentre?.id
        };

        if (!judiciary) {
          throw new Error('selectedJudiciary is required for upsertPayload');
        }
        const { availability, session: sessionType, unavailabilities = [] } = draftItinerary();
        const { startDate, endDate } = availability;
        return {
          ruleId,
          judiciaryId: judiciary.id,
          courtHouseId,
          startDate,
          endDate,
          sessionType,
          unavailabilities
        };
      })
    })),
    withMethods((store, service = inject(JudicialItineraryService)) => ({
      setDraftItinerary: (draftItinerary: DraftItinerary) => {
        store.clearServerSubmissionError();
        patchState(store, { draftItinerary });
      },
      addItinerary: rxMethod<{
        onAddSuccess?: () => void;
        onError?: (error: HttpErrorResponse) => void;
      }>(
        pipe(
          switchMap(({ onAddSuccess, onError }) => {
            const payload = store.upsertPayload();
            const repeatDays = store.normalisedSittingDays();
            return service
              .addAvailability({
                judiciaryId: payload.judiciaryId,
                courtHouseId: payload.courtHouseId,
                repeatDays,
                startDate: payload.startDate,
                endDate: payload.endDate,
                sessionType: payload.sessionType
              })
              .pipe(
                tapResponse({
                  next: () => {
                    if (onAddSuccess) {
                      onAddSuccess();
                    }
                  },
                  error: (err: HttpErrorResponse) => {
                    if (onError) {
                      onError(err);
                      return;
                    }
                    if (store.handleError) {
                      store.handleError(err);
                      return;
                    }
                    throw err;
                  }
                })
              );
          })
        )
      ),
      updateItinerary: rxMethod<{
        onUpdateSuccess?: () => void;
        onError?: (error: HttpErrorResponse) => void;
      }>(
        pipe(
          switchMap(({ onUpdateSuccess, onError }) => {
            const payload = store.upsertPayload();
            const repeatDays = store.normalisedSittingDays();
            return service
              .updateAvailability({
                ruleId: payload.ruleId,
                judiciaryId: payload.judiciaryId,
                courtHouseId: payload.courtHouseId,
                repeatDays,
                startDate: payload.startDate,
                endDate: payload.endDate,
                sessionType: payload.sessionType,
                unavailabilities: payload.unavailabilities
              })
              .pipe(
                tapResponse({
                  next: () => {
                    if (onUpdateSuccess) {
                      onUpdateSuccess();
                    }
                  },
                  error: (err: HttpErrorResponse) => {
                    if (onError) {
                      onError(err);
                      return;
                    }
                    if (store.handleError) {
                      store.handleError(err);
                      return;
                    }
                    throw err;
                  }
                })
              );
          })
        )
      ),
      removeItinerary: rxMethod<{
        onRemoveSuccess?: () => void;
        onError?: (error: HttpErrorResponse) => void;
      }>(
        pipe(
          switchMap(({ onRemoveSuccess, onError }) => {
            const itinerary = store.selectedItinerary();
            return service.removeAvailability(itinerary.id).pipe(
              tapResponse({
                next: () => {
                  if (onRemoveSuccess) {
                    onRemoveSuccess();
                  }
                },
                error: (err: HttpErrorResponse) => {
                  if (onError) {
                    onError(err);
                    return;
                  }

                  if (store.handleError) {
                    store.handleError(err);
                    return;
                  }

                  throw err;
                }
              })
            );
          })
        )
      ),
      validateAddItinerary: rxMethod<{ onValidateDone: (error?: HttpErrorResponse) => void }>(
        pipe(
          switchMap(({ onValidateDone }) => {
            const repeatDays = store.normalisedSittingDays();
            const { judiciaryId, courtHouseId, startDate, endDate, sessionType } =
              store.upsertPayload();

            return service
              .validateAvailability({
                judiciaryId,
                courtHouseId,
                repeatDays,
                startDate,
                endDate,
                sessionType
              })
              .pipe(
                tapResponse({
                  next: () => {
                    onValidateDone(undefined);
                  },
                  error: (err: HttpErrorResponse) => onValidateDone(err)
                })
              );
          })
        )
      ),
      resetUpsertJudiciaryItineraryState: () => {
        patchState(store, initialState);
      },
      clearUpsertItinerary: () => {
        store.clearJudiciarySelection();
        store.setSelectedItinerary(null);
        patchState(store, initialState);
      }
    }))
  );
}
