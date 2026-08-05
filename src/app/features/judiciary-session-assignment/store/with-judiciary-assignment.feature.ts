import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { pipe, switchMap } from 'rxjs';
import {
  patchState,
  signalStoreFeature,
  type,
  withComputed,
  withMethods,
  withState
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { withJudiciarySelection } from '../../../shared';
import type { JudiciarySelectionValue } from '../../../shared';
import { CourtScheduleSession } from '../../view-schedule/model/view-schedule.model';
import { JudiciarySessionAssignmentService } from '../services/judiciary-session-assignment.service';
import { JudiciaryAssignmentPayload } from '../model/judiciary-assignment-api.model';
import { transformJudiciarySelectionToPayload } from '../model/judiciary-assignment-transform';

export interface JudiciaryAssignmentState {
  referrer: string | null;
}

const initialState: JudiciaryAssignmentState = {
  referrer: null
};

// unused generic required due to TypeScript limitation with typed signalStoreFeature dependencies
// see: https://ngrx.io/guide/signals/signal-store/custom-store-features#known-typescript-issues
export function withJudiciaryAssignment<_>() {
  return signalStoreFeature(
    {
      state: type<{ sessions: CourtScheduleSession[] }>(),
      methods: type<{ handleError: (err: HttpErrorResponse) => void }>()
    },
    withState(initialState),
    withJudiciarySelection(),
    withComputed(({ sessions }) => ({
      sessionsWithJudiciary: computed(() =>
        sessions().filter((session) => (session.judiciaries?.length ?? 0) > 0)
      ),
      selectedSessionIds: computed(() => sessions().map((session) => session.courtScheduleId)),
      courtRoomNames: computed(() => sessions().map((session) => session.courtRoomName))
    })),
    withMethods((store, assignmentService = inject(JudiciarySessionAssignmentService)) => ({
      setReferrer: (referrer: string | null) => {
        patchState(store, { referrer });
      },
      assignJudiciary: rxMethod<{ value: JudiciarySelectionValue; onAssignSuccess: () => void }>(
        pipe(
          switchMap(({ value, onAssignSuccess }) => {
            const payload: JudiciaryAssignmentPayload = {
              courtScheduleIds: store.selectedSessionIds(),
              judiciary: transformJudiciarySelectionToPayload(value)
            };
            return assignmentService.assignJudiciaries(payload).pipe(
              tapResponse({
                next: () => onAssignSuccess(),
                error: (err: HttpErrorResponse) => store.handleError(err)
              })
            );
          })
        )
      ),
      removeAllJudiciary: rxMethod<{ onRemoveSuccess: () => void }>(
        pipe(
          switchMap(({ onRemoveSuccess }) => {
            const courtScheduleIds = store.selectedSessionIds();
            return assignmentService.removeAllJudiciaries(courtScheduleIds).pipe(
              tapResponse({
                next: () => onRemoveSuccess(),
                error: (err: HttpErrorResponse) => store.handleError(err)
              })
            );
          })
        )
      )
    }))
  );
}
