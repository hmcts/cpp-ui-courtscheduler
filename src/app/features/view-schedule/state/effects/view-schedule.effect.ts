import { Injectable, NgZone, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ViewScheduleActions } from '../actions';
import {
  asyncScheduler,
  catchError,
  delay,
  map,
  of,
  queueScheduler,
  SchedulerLike,
  switchMap
} from 'rxjs';
import { ViewScheduleService } from '../../services/view-schedule.service';
import { SearchSchedulesPayload } from '../../model/view-schedule.model';
import { HttpErrorResponse } from '@angular/common/http';
import { apiError } from '../../../../core/actions/api.actions';
import { observeOn, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { EnterZoneScheduler, LeaveZoneScheduler } from '../../../../shared/utils/zone-schedulers';
import { CourtSchedulerRoutes } from '../../../../app-routes';

@Injectable()
export class ViewScheduleEffects {
  private actions$ = inject(Actions);
  private viewScheduleService = inject(ViewScheduleService);
  private router = inject(Router);
  private zone = inject(NgZone);
  searchSchedules$;
  removeSessions$;
  removeSessionsSuccess$;
  setSuccessBannerSuccess$;
  assignCourtroom$;
  assignCourtroomSuccess$;
  enterZoneScheduler: SchedulerLike;
  leaveZoneScheduler: SchedulerLike;

  constructor() {
    this.enterZoneScheduler = new EnterZoneScheduler(this.zone, queueScheduler);
    this.leaveZoneScheduler = new LeaveZoneScheduler(this.zone, asyncScheduler);
    this.searchSchedules$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ViewScheduleActions.searchSchedules),
        switchMap(({ searchFormValues }) => {
          const payload: SearchSchedulesPayload = {
            sessionStartDate: searchFormValues.startDate,
            sessionEndDate: searchFormValues.endDate,
            courtCentreId: searchFormValues.courtCentre.id,
            businessType: searchFormValues.businessType,
            courtRoomId: searchFormValues.courtroomId
          };
          return this.viewScheduleService.searchSchedules(payload).pipe(
            map(({ courtSchedules }) => {
              return ViewScheduleActions.searchSchedulesSuccess({ courtSchedules });
            }),
            catchError((error: HttpErrorResponse) => of(apiError({ error })))
          );
        })
      )
    );

    this.removeSessions$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ViewScheduleActions.removeSessions),
        switchMap(({ sessionsToRemove }) => {
          const sessionsIdsToRemove = sessionsToRemove.map((session) => session.courtScheduleId);

          const payload = {
            sessions: sessionsIdsToRemove
          };

          return this.viewScheduleService.removeSessions(payload).pipe(
            switchMap(({ sessions: sessionsNotRemoved, error }) => {
              if (sessionsNotRemoved.length > 0) {
                return of(
                  ViewScheduleActions.setErrors({
                    errors: [
                      {
                        id: 'backendError',
                        message: error
                      }
                    ]
                  }),
                  ViewScheduleActions.setViewSessionsToRemove({
                    sessionsToRemove: sessionsNotRemoved
                  })
                );
              } else {
                return of(
                  ViewScheduleActions.removeSessionsSuccess({
                    courtRoomName: sessionsToRemove[0].courtRoomName
                  })
                );
              }
            }),
            catchError((error: HttpErrorResponse) => of(apiError({ error })))
          );
        })
      )
    );

    this.removeSessionsSuccess$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ViewScheduleActions.removeSessionsSuccess),
        switchMap(({ courtRoomName }) =>
          of(
            ViewScheduleActions.clearViewSessionsToRemove(),
            ViewScheduleActions.setViewBanner({
              message: 'Sessions removed successfully',
              bannerType: 'success',
              courtRoomName
            })
          )
        ),
        tap(() => this.router.navigate([`${CourtSchedulerRoutes.VIEW_SCHEDULE}`]))
      )
    );

    this.setSuccessBannerSuccess$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ViewScheduleActions.setViewBanner),
        delay(5000, this.leaveZoneScheduler),
        switchMap(() => {
          return of(ViewScheduleActions.clearViewBanner());
        }),
        observeOn(this.enterZoneScheduler)
      )
    );

    this.assignCourtroom$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ViewScheduleActions.assignCourtroom),
        switchMap(({ sessionsToAssign, courtroomId, courtRoomName }) => {
          const courtScheduleIds = sessionsToAssign.map((session) => session.courtScheduleId);

          const payload = {
            courtScheduleIds,
            courtRoomId: courtroomId
          };

          return this.viewScheduleService.assignCourtroom(payload).pipe(
            switchMap(({ errorGroups }) => {
              if (errorGroups.length > 0) {
                const failedSessions = errorGroups.flatMap((group) => group.sessions);
                const errorMessage = errorGroups.map((group) => group.error).join('; ');

                return of(
                  ViewScheduleActions.setErrors({
                    errors: [
                      {
                        id: 'backendError',
                        message: errorMessage
                      }
                    ]
                  }),
                  ViewScheduleActions.setViewSessionsToAssign({
                    sessionsToAssign: failedSessions
                  })
                );
              } else {
                return of(ViewScheduleActions.assignCourtroomSuccess({ courtRoomName }));
              }
            }),
            catchError((error: HttpErrorResponse) => of(apiError({ error })))
          );
        })
      )
    );

    this.assignCourtroomSuccess$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ViewScheduleActions.assignCourtroomSuccess),
        switchMap(({ courtRoomName }) =>
          of(
            ViewScheduleActions.clearViewSessionsToAssign(),
            ViewScheduleActions.setViewBanner({
              message: 'Courtroom assigned successfully',
              bannerType: 'success',
              courtRoomName
            })
          )
        ),
        tap(() => this.router.navigate([`${CourtSchedulerRoutes.VIEW_SCHEDULE}`]))
      )
    );
  }
}
