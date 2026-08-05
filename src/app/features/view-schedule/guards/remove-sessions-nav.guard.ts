import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { inject } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { ViewScheduleState } from '../state/view-schedule.state';
import { getSessionsToRemove } from '../state/selectors/view-schedule.selectors';

export const removeSessionsNavGuard = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store<ViewScheduleState>);

  return store.pipe(
    select(getSessionsToRemove),
    map((sessionsToRemove) => {
      return sessionsToRemove.length > 0 ? true : createUrlTreeFromSnapshot(route, [`..`]);
    }),
    take(1)
  );
};
