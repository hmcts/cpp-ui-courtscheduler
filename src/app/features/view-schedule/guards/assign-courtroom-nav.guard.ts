import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { inject } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { ViewScheduleState } from '../state/view-schedule.state';
import { getSessionsToAssign } from '../state/selectors/view-schedule.selectors';

export const assignCourtroomNavGuard = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store<ViewScheduleState>);

  return store.pipe(
    select(getSessionsToAssign),
    map((sessionsToAssign) => {
      return sessionsToAssign && sessionsToAssign.length > 0
        ? true
        : createUrlTreeFromSnapshot(route, [`..`]);
    }),
    take(1)
  );
};
