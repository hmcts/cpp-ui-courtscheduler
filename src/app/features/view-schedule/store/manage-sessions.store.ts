import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { pipe, switchMap } from 'rxjs';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { withErrorHandlerAdapter } from '../../../shared';
import { filterExists } from '../../../shared/utils/core.utils';
import { CourtScheduleSession, EditSessionFormValues } from '../model/view-schedule.model';
import { ViewScheduleService } from '../services/view-schedule.service';
import { withJudiciaryAssignment } from '../../judiciary-session-assignment/store/with-judiciary-assignment.feature';

export const ManageSessionsStore = signalStore(
  withState<{ sessions: CourtScheduleSession[] }>({ sessions: [] }),
  withErrorHandlerAdapter(),
  withJudiciaryAssignment(),
  withMethods((store) => ({
    setSelectedSessions: (sessions: CourtScheduleSession[]) => {
      patchState(store, { sessions });
    },
    clearState: () => {
      patchState(store, { sessions: [] });
      store.setReferrer(null);
      store.clearJudiciarySelection();
    }
  })),
  withMethods((store, viewScheduleService = inject(ViewScheduleService)) => ({
    updateSession: rxMethod<{
      formValues: EditSessionFormValues;
      onUpdateSuccess: (courtRoomName?: string) => void;
      onUpdateError: (error: HttpErrorResponse) => void;
    }>(
      pipe(
        switchMap(({ formValues, onUpdateSuccess, onUpdateError }) => {
          const session = store.sessions()[0];
          const { courtRoomName, ...rest } = formValues;

          const payload = filterExists({
            ...rest,
            courtScheduleId: session.courtScheduleId,
            allDaySplit: session.allDaySplit,
            jurisdiction: session.jurisdiction
          });

          return viewScheduleService.updateSession(payload).pipe(
            tapResponse({
              next: () => onUpdateSuccess(courtRoomName),
              error: (httpError: HttpErrorResponse) => onUpdateError(httpError)
            })
          );
        })
      )
    )
  }))
);
