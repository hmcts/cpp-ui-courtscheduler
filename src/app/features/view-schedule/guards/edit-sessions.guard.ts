import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { ManageSessionsStore } from '../store/manage-sessions.store';
import { ViewScheduleService } from '../services/view-schedule.service';
import { CourtScheduleSession } from '../model/view-schedule.model';

export const editSessionsGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<boolean> | boolean => {
  const store = inject(ManageSessionsStore);
  const router = inject(Router);
  const viewScheduleService = inject(ViewScheduleService);

  const sessionId = route.firstChild?.paramMap.get('id') ?? undefined;
  const sessions = router.getCurrentNavigation()?.extras?.state?.['sessions'] as
    | CourtScheduleSession[]
    | undefined;

  if (sessionId) {
    return viewScheduleService.searchCourtSchedulesById(sessionId).pipe(
      tap(([{ sessions }]) => {
        store.setSelectedSessions([sessions[0]]);
        store.setSelectedJudiciary(sessions[0].judiciaries ?? []);
      }),
      map(() => true),
      catchError((err: HttpErrorResponse) => {
        store.handleError(err);
        return of(false);
      })
    );
  }

  if (sessions?.length > 0) {
    store.setSelectedSessions(sessions);
  }

  return true;
};
