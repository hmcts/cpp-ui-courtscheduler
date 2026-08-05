import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { inject } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { ViewScheduleState } from '../state/view-schedule.state';
import { getSessionToEdit } from '../state/selectors/view-schedule.selectors';

export const editSessionNavGuard = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store<ViewScheduleState>);

  return store.pipe(
    select(getSessionToEdit),
    map((sessionToEdit) => {
      return !!sessionToEdit ? true : createUrlTreeFromSnapshot(route, ['..']);
    }),
    take(1)
  );
};
