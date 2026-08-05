import { Injectable, NgZone, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, delay, map, observeOn, switchMap, tap } from 'rxjs/operators';
import { CreateScheduleActions } from '../actions';
import { asyncScheduler, of, queueScheduler, SchedulerLike, withLatestFrom } from 'rxjs';
import { CreateScheduleService } from '../../services/create-schedule.service';
import { HttpErrorResponse } from '@angular/common/http';
import { apiError } from '../../../../core/actions/api.actions';
import { Store } from '@ngrx/store';
import { CreateScheduleState } from '../create-schedule.state';
import { CourtSchedulePayload, SessionPayload, ValidateSessionPayload } from '../../model';
import { getDaysOfWeek, getJurisdiction, resolveSessionTimes } from '../../../../shared';
import { CourtroomAssignmentType } from '../../../../shared/model/courtroom-assignment';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { PanelType } from '../../../../shared/model/panel';
import { Router } from '@angular/router';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { EnterZoneScheduler, LeaveZoneScheduler } from '../../../../shared/utils/zone-schedulers';
import { CourtSchedulerRoutes } from '../../../../app-routes';

enum SuccessMessages {
  ADD_SESSION = 'Session added successfully',
  REMOVE_SESSION = 'Session removed successfully'
}

type AddSessionType = typeof CreateScheduleActions.addSession.type;
type RemoveSessionType = typeof CreateScheduleActions.removeSession.type;
type Action = AddSessionType | RemoveSessionType;

type SessionMessage = SuccessMessages.ADD_SESSION | SuccessMessages.REMOVE_SESSION;

const SESSION_MESSAGES: Record<Action, SessionMessage> = {
  [CreateScheduleActions.addSession.type]: SuccessMessages.ADD_SESSION,
  [CreateScheduleActions.removeSession.type]: SuccessMessages.REMOVE_SESSION
};

@Injectable()
export class CreateScheduleEffects {
  private actions$ = inject(Actions);
  private courtSchedulerService = inject(CreateScheduleService);
  private store = inject<Store<CreateScheduleState>>(Store);
  private router = inject(Router);
  private zone = inject(NgZone);

  addSession$;
  createCourtSchedule$;
  setBannerSuccess$;
  removeSession$;
  submitSession$;
  copySession$;
  enterZoneScheduler: SchedulerLike;
  leaveZoneScheduler: SchedulerLike;

  constructor() {
    this.enterZoneScheduler = new EnterZoneScheduler(this.zone, queueScheduler);
    this.leaveZoneScheduler = new LeaveZoneScheduler(this.zone, asyncScheduler);
    this.addSession$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CreateScheduleActions.addSession),
        switchMap((action) =>
          of(
            CreateScheduleActions.setCreateBanner({
              message: SESSION_MESSAGES[action.type],
              bannerType: 'success'
            }),
            CreateScheduleActions.setErrors({
              errors: []
            })
          )
        )
      )
    );

    this.createCourtSchedule$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CreateScheduleActions.createCourtSchedule),
        withLatestFrom(this.store),
        switchMap(([_, { courtScheduleDraft }]) => {
          const jurisdiction = getJurisdiction(courtScheduleDraft.selectedCourtCentre);
          const isCrown = jurisdiction === JurisdictionType.CROWN;
          const defaultStartTime = courtScheduleDraft.selectedCourtCentre.defaultStartTime;
          const payload: CourtSchedulePayload = {
            sessions: courtScheduleDraft.sessions.map((session) => ({
              courtCentreId: courtScheduleDraft.selectedCourtCentre.id,
              jurisdiction,
              courtRoomId: session.courtroom.id,
              sessionType: session.sessionType,
              businessType: session.businessType.typeCode,
              duration: session.duration,
              allDaySplit: session.allDaySplit,
              maxDurationForMorning: session.maxDurationForMorning,
              maxDurationForAfternoon: session.maxDurationForAfternoon,
              panel: isCrown ? PanelType.ADULT : session.panelType,
              ...resolveSessionTimes(
                session.sessionType,
                defaultStartTime,
                session.sessionStartTime,
                session.sessionEndTime
              ),
              isOverbookingAllowed: session.isOverbookingAllowed,
              repeatDays: getDaysOfWeek(session.repeatDays),
              isDraft: isCrown
                ? session.courtroomAssignment === CourtroomAssignmentType.DRAFT
                : false,
              index: session.index
            })),
            repeatPattern: courtScheduleDraft.repeatPattern
          };

          return this.courtSchedulerService.createCourtSchedule(payload).pipe(
            map((_) => CreateScheduleActions.createCourtScheduleSuccess({ isPersisted: true })),
            catchError((error: HttpErrorResponse) => of(apiError({ error })))
          );
        })
      )
    );

    this.submitSession$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CreateScheduleActions.submitSession),
        withLatestFrom(this.store),
        switchMap(
          ([
            { existingSessions, sessionToBeAdded, repeatPattern },
            {
              courtScheduleDraft: { selectedCourtCentre }
            }
          ]) => {
            const courtCentreId = selectedCourtCentre.id;
            const jurisdiction = getJurisdiction(selectedCourtCentre);
            const isCrown = jurisdiction === JurisdictionType.CROWN;
            const defaultStartTime = selectedCourtCentre.defaultStartTime;

            const sessionToBeAddedParsed: SessionPayload = {
              courtCentreId,
              jurisdiction,
              courtRoomId: sessionToBeAdded.courtroom.id,
              sessionType: sessionToBeAdded.sessionType,
              businessType: sessionToBeAdded.businessType.typeCode,
              duration: sessionToBeAdded.duration,
              allDaySplit: sessionToBeAdded.allDaySplit,
              maxDurationForMorning: sessionToBeAdded.maxDurationForMorning,
              maxDurationForAfternoon: sessionToBeAdded.maxDurationForAfternoon,
              panel: isCrown ? PanelType.ADULT : sessionToBeAdded.panelType,
              ...resolveSessionTimes(
                sessionToBeAdded.sessionType,
                defaultStartTime,
                sessionToBeAdded.sessionStartTime,
                sessionToBeAdded.sessionEndTime
              ),
              isOverbookingAllowed: sessionToBeAdded.isOverbookingAllowed,
              repeatDays: getDaysOfWeek(sessionToBeAdded.repeatDays),
              isDraft: isCrown
                ? sessionToBeAdded.courtroomAssignment === CourtroomAssignmentType.DRAFT
                : false,
              index: sessionToBeAdded.index
            };

            const payload: ValidateSessionPayload = {
              sessions: existingSessions.map((session) => ({
                courtCentreId,
                jurisdiction,
                courtRoomId: session.courtroom.id,
                sessionType: session.sessionType,
                businessType: session.businessType.typeCode,
                duration: session.duration,
                allDaySplit: session.allDaySplit,
                maxDurationForMorning: session.maxDurationForMorning,
                maxDurationForAfternoon: session.maxDurationForAfternoon,
                panel: isCrown ? PanelType.ADULT : session.panelType,
                ...resolveSessionTimes(
                  session.sessionType,
                  defaultStartTime,
                  session.sessionStartTime,
                  session.sessionEndTime
                ),
                isOverbookingAllowed: session.isOverbookingAllowed,
                repeatDays: getDaysOfWeek(session.repeatDays),
                courtroomAssignment: session.courtroomAssignment,
                isDraft: isCrown
                  ? session.courtroomAssignment === CourtroomAssignmentType.DRAFT
                  : false,
                index: session.index
              })),
              sessionToBeAdded: sessionToBeAddedParsed,
              repeatPattern
            };

            return this.courtSchedulerService.validateSession(payload).pipe(
              switchMap(() =>
                of(
                  CreateScheduleActions.addSession({
                    session: sessionToBeAdded
                  }),
                  CreateScheduleActions.submitSessionSuccess()
                )
              ),

              catchError((httpError: HttpErrorResponse) => {
                if (httpError.status === 400) {
                  const parsedError = JSON.parse(httpError.error);

                  return of(
                    CreateScheduleActions.setErrors({
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
          }
        )
      )
    );

    this.copySession$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CreateScheduleActions.copySession),
        withLatestFrom(this.store),
        switchMap(
          ([
            { existingSessions, sessionToBeAdded, repeatPattern },
            {
              courtScheduleDraft: { selectedCourtCentre }
            }
          ]) => {
            const courtCentreId = selectedCourtCentre.id;
            const jurisdiction = getJurisdiction(selectedCourtCentre);
            const isCrown = jurisdiction === JurisdictionType.CROWN;
            const defaultStartTime = selectedCourtCentre.defaultStartTime;

            const sessionToBeAddedParsed: SessionPayload = {
              courtCentreId,
              jurisdiction,
              courtRoomId: sessionToBeAdded.courtroom.id,
              sessionType: sessionToBeAdded.sessionType,
              businessType: sessionToBeAdded.businessType.typeCode,
              duration: sessionToBeAdded.duration,
              allDaySplit: sessionToBeAdded.allDaySplit,
              maxDurationForMorning: sessionToBeAdded.maxDurationForMorning,
              maxDurationForAfternoon: sessionToBeAdded.maxDurationForAfternoon,
              panel: isCrown ? PanelType.ADULT : sessionToBeAdded.panelType,
              ...resolveSessionTimes(
                sessionToBeAdded.sessionType,
                defaultStartTime,
                sessionToBeAdded.sessionStartTime,
                sessionToBeAdded.sessionEndTime
              ),
              isOverbookingAllowed: sessionToBeAdded.isOverbookingAllowed,
              repeatDays: getDaysOfWeek(sessionToBeAdded.repeatDays),
              isDraft: isCrown
                ? sessionToBeAdded.courtroomAssignment === CourtroomAssignmentType.DRAFT
                : false,
              index: sessionToBeAdded.index
            };

            const payload: ValidateSessionPayload = {
              sessions: existingSessions.map((session) => ({
                courtCentreId,
                jurisdiction,
                courtRoomId: session.courtroom.id,
                sessionType: session.sessionType,
                businessType: session.businessType.typeCode,
                duration: session.duration,
                allDaySplit: session.allDaySplit,
                maxDurationForMorning: session.maxDurationForMorning,
                maxDurationForAfternoon: session.maxDurationForAfternoon,
                panel: isCrown ? PanelType.ADULT : session.panelType,
                ...resolveSessionTimes(
                  session.sessionType,
                  defaultStartTime,
                  session.sessionStartTime,
                  session.sessionEndTime
                ),
                isOverbookingAllowed: session.isOverbookingAllowed,
                repeatDays: getDaysOfWeek(session.repeatDays),
                courtroomAssignment: session.courtroomAssignment,
                isDraft: isCrown
                  ? session.courtroomAssignment === CourtroomAssignmentType.DRAFT
                  : false,
                index: session.index
              })),
              sessionToBeAdded: sessionToBeAddedParsed,
              repeatPattern: repeatPattern
            };

            return this.courtSchedulerService.validateSession(payload).pipe(
              switchMap(() =>
                of(
                  CreateScheduleActions.addSession({
                    session: sessionToBeAdded
                  })
                )
              ),
              tap(() =>
                this.router.navigate([
                  `${CourtSchedulerRoutes.CREATE_SCHEDULE}/${CreateScheduleRoutes.SESSIONS_FORM}`
                ])
              ),
              catchError((httpError: HttpErrorResponse) => {
                if (httpError.status === 400) {
                  const parsedError = JSON.parse(httpError.error);

                  return of(
                    CreateScheduleActions.setErrors({
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
          }
        )
      )
    );

    this.setBannerSuccess$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CreateScheduleActions.setCreateBanner),
        delay(5000, this.leaveZoneScheduler),
        switchMap(() => {
          return of(CreateScheduleActions.clearCreateBanner());
        }),
        observeOn(this.enterZoneScheduler)
      )
    );

    this.removeSession$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CreateScheduleActions.removeSession),
        map((action) =>
          CreateScheduleActions.setCreateBanner({
            message: SESSION_MESSAGES[action.type],
            bannerType: 'success'
          })
        ),
        tap(() =>
          this.router.navigate([
            `${CourtSchedulerRoutes.CREATE_SCHEDULE}/${CreateScheduleRoutes.SESSIONS_FORM}`
          ])
        )
      )
    );
  }
}
