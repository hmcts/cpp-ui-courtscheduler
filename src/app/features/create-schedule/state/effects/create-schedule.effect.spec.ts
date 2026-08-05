import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';
import { cold, hot } from 'jasmine-marbles';
import { Action } from '@ngrx/store';
import {
  mockCourtScheduleDraft,
  mockCourtSchedulePayload,
  mockRepeatPattern,
  mockSession,
  mockValidateSessionPayload
} from '../../../../shared';
import { CreateScheduleActions } from '../actions';
import { CreateScheduleEffects } from './create-schedule.effects';
import { CreateScheduleService } from '../../services/create-schedule.service';
import { HttpErrorResponse } from '@angular/common/http';
import { apiError } from '../../../../core/actions/api.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { CourtSchedulerRoutes } from '../../../../app-routes';

describe('CreateScheduleEffects', () => {
  let actions$: Observable<Action>;
  let effects: CreateScheduleEffects;
  let createScheduleService: CreateScheduleService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CreateScheduleEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: {
            courtScheduleDraft: mockCourtScheduleDraft
          }
        }),
        {
          provide: CreateScheduleService,
          useValue: {
            createCourtSchedule: jest.fn(),
            validateSession: jest.fn()
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                params: {}
              }
            }
          }
        }
      ]
    });
    effects = TestBed.inject(CreateScheduleEffects);
    createScheduleService = TestBed.inject(CreateScheduleService);
    router = TestBed.inject(Router);
  });

  describe('addSession$', () => {
    it('should dispatch setBanner with "Session added successfully" message for addSession action', () => {
      const action = CreateScheduleActions.addSession({ session: mockSession });
      const completion1 = CreateScheduleActions.setCreateBanner({
        message: 'Session added successfully',
        bannerType: 'success'
      });
      const completion2 = CreateScheduleActions.setErrors({ errors: [] });

      actions$ = hot('-a', { a: action });
      const expected$ = cold('-(bc)', { b: completion1, c: completion2 });

      expect(effects.addSession$).toBeObservable(expected$);
    });
  });

  describe('submitSession$', () => {
    it('should dispatch addSession and submitSessionSuccess actions on success', () => {
      const action = CreateScheduleActions.submitSession({
        existingSessions: [mockSession],
        sessionToBeAdded: mockSession,
        repeatPattern: mockRepeatPattern
      });

      actions$ = hot('-a', { a: action });

      const response$ = cold('-b|', { b: {} });
      createScheduleService.validateSession = jest.fn().mockReturnValueOnce(response$);

      const completion1 = CreateScheduleActions.addSession({ session: mockSession });
      const completion2 = CreateScheduleActions.submitSessionSuccess();
      const expected$ = cold('--(bc)', { b: completion1, c: completion2 });

      expect(effects.submitSession$).toBeObservable(expected$);
      expect(createScheduleService.validateSession).toHaveBeenCalledWith({
        ...mockValidateSessionPayload,
        sessions: [
          {
            ...mockValidateSessionPayload.sessions[0],
            panel: mockSession.panelType,
            isDraft: false
          }
        ],
        sessionToBeAdded: {
          ...mockValidateSessionPayload.sessionToBeAdded,
          panel: mockSession.panelType,
          isDraft: false
        }
      });
    });

    it('should dispatch setErrors action on duplicate session error', () => {
      const action = CreateScheduleActions.submitSession({
        existingSessions: [mockSession],
        sessionToBeAdded: mockSession,
        repeatPattern: mockRepeatPattern
      });

      actions$ = hot('-a', { a: action });

      const httpError = new HttpErrorResponse({
        status: 400,
        error: JSON.stringify({
          error: 'Session to be added has a duplicate'
        })
      });

      const response$ = cold('-#|', null, httpError);
      createScheduleService.validateSession = jest.fn().mockReturnValueOnce(response$);

      const completion = CreateScheduleActions.setErrors({
        errors: [
          {
            id: 'backendError',
            message: 'Session to be added has a duplicate'
          }
        ]
      });
      const expected$ = cold('--b', { b: completion });

      expect(effects.submitSession$).toBeObservable(expected$);
      expect(createScheduleService.validateSession).toHaveBeenCalled();
    });

    it('should dispatch apiError action on other errors', () => {
      const action = CreateScheduleActions.submitSession({
        existingSessions: [mockSession],
        sessionToBeAdded: mockSession,
        repeatPattern: mockRepeatPattern
      });

      actions$ = hot('-a', { a: action });

      const error = new HttpErrorResponse({ status: 500 });
      const response$ = cold('-#|', {}, error);
      createScheduleService.validateSession = jest.fn().mockReturnValueOnce(response$);

      const completion = apiError({ error });
      const expected$ = cold('--b', { b: completion });

      expect(effects.submitSession$).toBeObservable(expected$);
      expect(createScheduleService.validateSession).toHaveBeenCalled();
    });
  });

  describe('copySession$', () => {
    it('should dispatch addSession and navigate on success', () => {
      const action = CreateScheduleActions.copySession({
        existingSessions: [mockSession],
        sessionToBeAdded: mockSession,
        repeatPattern: mockRepeatPattern
      });

      actions$ = hot('-a', { a: action });

      const response$ = cold('-b|', { b: {} });
      createScheduleService.validateSession = jest.fn().mockReturnValueOnce(response$);

      const completion = CreateScheduleActions.addSession({ session: mockSession });
      const expected$ = cold('--b', { b: completion });

      expect(effects.copySession$).toBeObservable(expected$);
      expect(createScheduleService.validateSession).toHaveBeenCalledWith({
        ...mockValidateSessionPayload,
        sessions: [
          {
            ...mockValidateSessionPayload.sessions[0],
            panel: mockSession.panelType,
            isDraft: false
          }
        ],
        sessionToBeAdded: {
          ...mockValidateSessionPayload.sessionToBeAdded,
          panel: mockSession.panelType,
          isDraft: false
        }
      });
      expect(router.navigate).toHaveBeenCalledWith([
        `${CourtSchedulerRoutes.CREATE_SCHEDULE}/${CreateScheduleRoutes.SESSIONS_FORM}`
      ]);
    });

    it('should dispatch setErrors action on duplicate session error', () => {
      const action = CreateScheduleActions.copySession({
        existingSessions: [mockSession],
        sessionToBeAdded: mockSession,
        repeatPattern: mockRepeatPattern
      });

      actions$ = hot('-a', { a: action });

      const httpError = new HttpErrorResponse({
        status: 400,
        error: JSON.stringify({
          error: 'Session to be added has a duplicate'
        })
      });

      const response$ = cold('-#|', null, httpError);
      createScheduleService.validateSession = jest.fn().mockReturnValueOnce(response$);

      const completion = CreateScheduleActions.setErrors({
        errors: [
          {
            id: 'backendError',
            message: 'Session to be added has a duplicate'
          }
        ]
      });
      const expected$ = cold('--b', { b: completion });

      expect(effects.copySession$).toBeObservable(expected$);
      expect(createScheduleService.validateSession).toHaveBeenCalled();
    });

    it('should dispatch apiError action on other errors', () => {
      const action = CreateScheduleActions.copySession({
        existingSessions: [mockSession],
        sessionToBeAdded: mockSession,
        repeatPattern: mockRepeatPattern
      });

      actions$ = hot('-a', { a: action });

      const error = new HttpErrorResponse({ status: 500 });
      const response$ = cold('-#|', {}, error);
      createScheduleService.validateSession = jest.fn().mockReturnValueOnce(response$);

      const completion = apiError({ error });
      const expected$ = cold('--b', { b: completion });

      expect(effects.copySession$).toBeObservable(expected$);
      expect(createScheduleService.validateSession).toHaveBeenCalled();
    });
  });

  describe('removeSessions$', () => {
    it('should dispatch setBanner with "Session removed successfully" message for removeSession action', () => {
      const action = CreateScheduleActions.removeSession({ sessions: [mockSession] });
      actions$ = hot('-a', { a: action });

      const completion = CreateScheduleActions.setCreateBanner({
        message: 'Session removed successfully',
        bannerType: 'success'
      });
      const expected$ = cold('-b', { b: completion });

      expect(effects.removeSession$).toBeObservable(expected$);
      expect(router.navigate).toHaveBeenCalledWith([
        `${CourtSchedulerRoutes.CREATE_SCHEDULE}/${CreateScheduleRoutes.SESSIONS_FORM}`
      ]);
    });
  });

  describe('createCourtSchedule$', () => {
    it('should return createCourtScheduleSuccess action with isPersisted on success', () => {
      const action = CreateScheduleActions.createCourtSchedule();
      actions$ = hot('-a', { a: action });

      const completion = CreateScheduleActions.createCourtScheduleSuccess({ isPersisted: true });

      const response$ = cold('-b|', { b: { mockCourtSchedulePayload } });
      createScheduleService.createCourtSchedule = jest.fn().mockReturnValueOnce(response$);

      const expected$ = cold('--b', { b: completion });

      expect(effects.createCourtSchedule$).toBeObservable(expected$);
      expect(createScheduleService.createCourtSchedule).toHaveBeenCalled();
    });

    it('should return apiError action on failure', () => {
      const action = CreateScheduleActions.createCourtSchedule();
      actions$ = hot('-a', { a: action });

      const error = new HttpErrorResponse({ error: 'error' });

      const response$ = cold('-#|', {}, error);
      createScheduleService.createCourtSchedule = jest.fn().mockReturnValueOnce(response$);

      const completion = apiError({ error });
      const expected$ = cold('--b', { b: completion });

      expect(effects.createCourtSchedule$).toBeObservable(expected$);
      expect(createScheduleService.createCourtSchedule).toHaveBeenCalled();
    });
  });
});
