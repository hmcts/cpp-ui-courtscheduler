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
import { observeOn, tap, withLatestFrom } from 'rxjs/operators';
import { Router } from '@angular/router';
import { EnterZoneScheduler, LeaveZoneScheduler } from '../../../../shared/utils/zone-schedulers';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { ViewScheduleState } from '../view-schedule.state';
import { Store } from '@ngrx/store';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { getJurisdiction } from '../selectors/view-schedule.selectors';
import { PanelType } from '../../../../shared/model/panel';
import { CourtroomAssignmentType } from '../../../../shared/model/courtroom-assignment';

@Injectable()
export class ViewScheduleEffects {
  private actions$ = inject(Actions);
  private viewScheduleService = inject(ViewScheduleService);
  private router = inject(Router);
  private zone = inject(NgZone);
  private store = inject<Store<ViewScheduleState>>(Store);

  searchSchedules$;
  removeSessions$;
  removeSessionsSuccess$;
  updateSchedules$;
  updateSchedulesSuccess$;
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
                return of(ViewScheduleActions.removeSessionsSuccess());
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
        switchMap(() =>
          of(
            ViewScheduleActions.clearViewSessionsToRemove(),
            ViewScheduleActions.setViewBanner({
              message: 'Sessions removed successfully',
              bannerType: 'success'
            })
          )
        ),
        tap(() => this.router.navigate([`${CourtSchedulerRoutes.VIEW_SCHEDULE}`]))
      )
    );

    this.updateSchedules$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ViewScheduleActions.updateSession),
        withLatestFrom(this.store.select(getJurisdiction)),
        switchMap(([{ session }, jurisdiction]) => {
          const isCrown = jurisdiction === JurisdictionType.CROWN;

          const {
            courtScheduleId,
            courtRoomId,
            businessType,
            courtSession,
            sessionStartTime,
            sessionEndTime,
            maxSlots,
            maxDuration,
            maxDurationForMorning,
            maxDurationForAfternoon,
            allDaySplit,
            panel,
            courtroomAssignment
          } = session;

          const payload = {
            courtScheduleId,
            courtRoomId,
            businessType,
            courtSession,
            sessionStartTime,
            sessionEndTime,
            isOverbookingAllowed: session.isOverbookingAllowed ?? false,
            ...(maxSlots !== undefined ? { maxSlots } : { maxDuration }),
            ...(maxDurationForMorning !== undefined && { maxDurationForMorning }),
            ...(maxDurationForAfternoon !== undefined && { maxDurationForAfternoon }),
            ...(allDaySplit !== undefined && { allDaySplit }),
            panel: isCrown ? PanelType.ADULT : panel,
            ...(isCrown && {
              isDraft: courtroomAssignment === CourtroomAssignmentType.DRAFT
            }),
            jurisdiction
          };
          return this.viewScheduleService.updateSession(payload).pipe(
            map(() => ViewScheduleActions.updateSessionSuccess()),
            catchError((httpError: HttpErrorResponse) => {
              if (httpError.status === 400) {
                const parsedError = JSON.parse(httpError.error);

                return of(
                  ViewScheduleActions.setErrors({
                    errors: [
                      {
                        id: 'backendError',
                        message: parsedError.error
                      }
                    ]
                  })
                );
              }
              return of(apiError({ error: httpError }));
            })
          );
        })
      )
    );

    this.updateSchedulesSuccess$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ViewScheduleActions.updateSessionSuccess),
        map(() =>
          ViewScheduleActions.setViewBanner({
            message: 'Sessions updated successfully',
            bannerType: 'success'
          })
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
        switchMap(({ sessionsToAssign, courtroomId }) => {
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
                return of(ViewScheduleActions.assignCourtroomSuccess());
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
        switchMap(() =>
          of(
            ViewScheduleActions.clearViewSessionsToAssign(),
            ViewScheduleActions.setViewBanner({
              message: 'Courtroom assigned successfully',
              bannerType: 'success'
            })
          )
        ),
        tap(() => this.router.navigate([`${CourtSchedulerRoutes.VIEW_SCHEDULE}`]))
      )
    );
  }
}
