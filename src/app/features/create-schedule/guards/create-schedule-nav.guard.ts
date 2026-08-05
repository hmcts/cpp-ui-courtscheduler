import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { inject } from '@angular/core';
import { map, take } from 'rxjs/operators';
import {
  getIsPersisted,
  getRepeatPattern,
  getSelectedBusinessType,
  getSelectedCourtCentre,
  getSessions,
  getSessionsToRemove
} from '../state/selectors/create-schedule.selectors';
import { CreateScheduleState } from '../state/create-schedule.state';
import { withLatestFrom } from 'rxjs';
import { CreateScheduleRoutes } from '../create-schedule.routes';

export const createScheduleNavGuard = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store<CreateScheduleState>);
  const path = route.firstChild?.routeConfig?.path;

  return store.pipe(
    select(getSelectedCourtCentre),
    withLatestFrom(
      store.pipe(select(getSelectedBusinessType)),
      store.pipe(select(getSessions)),
      store.pipe(select(getSessionsToRemove)),
      store.pipe(select(getRepeatPattern)),
      store.pipe(select(getIsPersisted))
    ),
    map(
      ([
        selectedCourt,
        selectedBusinessType,
        sessions,
        sessionsToRemove,
        repeatPattern,
        isPersisted
      ]) => {
        switch (path) {
          case CreateScheduleRoutes.SELECT_COURT:
            return true;
          case CreateScheduleRoutes.SELECT_BUSINESS_TYPE:
            return !!selectedCourt;
          case CreateScheduleRoutes.REPEAT_PATTERN:
          case CreateScheduleRoutes.SESSIONS_FORM:
          case CreateScheduleRoutes.COPY_SESSIONS:
            return !!selectedCourt && !!selectedBusinessType;
          case CreateScheduleRoutes.REMOVE_SESSIONS:
            return !!selectedCourt && !!selectedBusinessType && sessionsToRemove.length > 0;
          case CreateScheduleRoutes.SUMMARY:
            return (
              !!selectedCourt && !!selectedBusinessType && sessions.length > 0 && !!repeatPattern
            );
          case CreateScheduleRoutes.SUCCESS:
            return isPersisted;
          default:
            return false;
        }
      }
    ),
    map(
      (canActivate: boolean) =>
        canActivate || createUrlTreeFromSnapshot(route, [CreateScheduleRoutes.SELECT_COURT])
    ),
    take(1)
  );
};
