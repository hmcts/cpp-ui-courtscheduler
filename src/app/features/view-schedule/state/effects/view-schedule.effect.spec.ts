import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';
import { cold, hot } from 'jasmine-marbles';
import { Action } from '@ngrx/store';
import { ViewScheduleActions } from '../actions';
import { ViewScheduleService } from '../../services/view-schedule.service';
import { CourtScheduleSession, SearchSchedulesPayload } from '../../model/view-schedule.model';
import { apiError } from '../../../../core/actions/api.actions';
import { HttpErrorResponse } from '@angular/common/http';
import { ViewScheduleEffects } from './view-schedule.effect';
import {
  mockCourtScheduleResponse,
  mockCourtScheduleSession,
  mockSearchFormValues
} from '../../../../shared';
import { Router } from '@angular/router';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

describe('ViewScheduleEffects', () => {
  let actions$: Observable<Action>;
  let effects: ViewScheduleEffects;
  let viewScheduleService: ViewScheduleService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ViewScheduleEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: {
            viewSchedule: {
              jurisdiction: JurisdictionType.MAGISTRATES
            }
          }
        }),
        {
          provide: ViewScheduleService,
          useValue: {
            searchSchedules: jest.fn(),
            removeSessions: jest.fn(),
            updateSession: jest.fn(),
            assignCourtroom: jest.fn()
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        }
      ]
    });
    effects = TestBed.inject(ViewScheduleEffects);
    viewScheduleService = TestBed.inject(ViewScheduleService);
    router = TestBed.inject(Router);
  });

  describe('searchSchedules$', () => {
    it('should return searchSchedulesSuccess action on success', () => {
      const searchFormValues = mockSearchFormValues;
      const action = ViewScheduleActions.searchSchedules({ searchFormValues });
      const completion = ViewScheduleActions.searchSchedulesSuccess({
        courtSchedules: mockCourtScheduleResponse.courtSchedules
      });

      actions$ = hot('-a', { a: action });
      const response$ = cold('-b|', {
        b: { courtSchedules: mockCourtScheduleResponse.courtSchedules }
      });

      const payload: SearchSchedulesPayload = {
        sessionStartDate: searchFormValues.startDate,
        sessionEndDate: searchFormValues.endDate,
        courtCentreId: searchFormValues.courtCentre.id,
        businessType: searchFormValues.businessType,
        courtRoomId: searchFormValues.courtroomId
      };

      viewScheduleService.searchSchedules = jest.fn().mockReturnValueOnce(response$);

      const expected$ = cold('--b', { b: completion });

      expect(effects.searchSchedules$).toBeObservable(expected$);
      expect(viewScheduleService.searchSchedules).toHaveBeenCalledWith(payload);
    });

    it('should return apiError action on failure', () => {
      const searchFormValues = mockSearchFormValues;
      const action = ViewScheduleActions.searchSchedules({ searchFormValues });
      const error = new HttpErrorResponse({ error: 'error' });
      const completion = apiError({ error });

      actions$ = hot('-a', { a: action });
      const response$ = cold('-#|', {}, error);

      viewScheduleService.searchSchedules = jest.fn().mockReturnValueOnce(response$);

      const expected$ = cold('--b', { b: completion });

      expect(effects.searchSchedules$).toBeObservable(expected$);
      expect(viewScheduleService.searchSchedules).toHaveBeenCalled();
    });
  });

  describe('removeSessions$', () => {
    it('should return removeSessionsSuccess action on success', () => {
      const sessionsToRemove = [
        { courtScheduleId: 'id', courtRoomId: '1' }
      ] as CourtScheduleSession[];
      const action = ViewScheduleActions.removeSessions({ sessionsToRemove });
      const completion = ViewScheduleActions.removeSessionsSuccess({
        courtRoomName: sessionsToRemove[0].courtRoomName
      });

      actions$ = hot('-a-', { a: action });
      const response$ = cold('-a|', { a: { sessions: [] } });

      viewScheduleService.removeSessions = jest.fn().mockReturnValueOnce(response$);

      const payload = {
        sessions: ['id']
      };

      const expected$ = cold('--b', { b: completion });

      expect(effects.removeSessions$).toBeObservable(expected$);
      expect(viewScheduleService.removeSessions).toHaveBeenCalledWith(payload);
    });

    it('should return setErrors and setViewSessionsToRemove action on partial success', () => {
      const sessionsToRemove = [
        { courtScheduleId: 'id', courtRoomId: '1' }
      ] as CourtScheduleSession[];
      const action = ViewScheduleActions.removeSessions({ sessionsToRemove });

      actions$ = hot('-a-', { a: action });

      const notRemovedSessions = [mockCourtScheduleSession];
      const error = 'Some sessions could not be removed. Please check again.';
      const response$ = cold('-a|', { a: { sessions: notRemovedSessions, error } });

      viewScheduleService.removeSessions = jest.fn().mockReturnValueOnce(response$);

      const payload = {
        sessions: ['id']
      };

      const expected$ = cold('--(ab)', {
        a: ViewScheduleActions.setErrors({
          errors: [
            {
              id: 'backendError',
              message: error
            }
          ]
        }),
        b: ViewScheduleActions.setViewSessionsToRemove({
          sessionsToRemove: notRemovedSessions
        })
      });

      expect(effects.removeSessions$).toBeObservable(expected$);
      expect(viewScheduleService.removeSessions).toHaveBeenCalledWith(payload);
    });

    it('should return apiError on failure', () => {
      const sessionsToRemove = [
        { courtScheduleId: 'id', courtRoomId: '1' }
      ] as CourtScheduleSession[];
      const action = ViewScheduleActions.removeSessions({ sessionsToRemove });
      const error = new HttpErrorResponse({ error: 'Error' });
      const completion = apiError({ error });

      actions$ = hot('-a-', { a: action });
      const response$ = cold('-#|', {}, error);

      viewScheduleService.removeSessions = jest.fn().mockReturnValueOnce(response$);

      const expected$ = cold('--b', { b: completion });

      expect(effects.removeSessions$).toBeObservable(expected$);
      expect(viewScheduleService.removeSessions).toHaveBeenCalled();
    });
  });

  describe('removeSessionsSuccess$', () => {
    it('should return clearViewSessionsToRemove and setSuccessBanner actions on success and navigate to VIEW_SCHEDULE page', () => {
      const action = ViewScheduleActions.removeSessionsSuccess({});
      const banner = {
        message: 'Sessions removed successfully',
        bannerType: 'success',
        courtRoomName: undefined as string | undefined
      };
      const clearAction = ViewScheduleActions.clearViewSessionsToRemove();
      const successBannerAction = ViewScheduleActions.setViewBanner(banner);

      actions$ = hot('-a-', { a: action });

      const expected$ = cold('-(ab)', {
        a: clearAction,
        b: successBannerAction
      });

      expect(effects.removeSessionsSuccess$).toBeObservable(expected$);
      expect(router.navigate).toHaveBeenCalledWith([CourtSchedulerRoutes.VIEW_SCHEDULE]);
    });
  });

  describe('assignCourtroom$', () => {
    it('should return assignCourtroomSuccess action when errorGroups is empty', () => {
      const sessionsToAssign = [
        { courtScheduleId: 'id1', courtRoomId: '1' }
      ] as CourtScheduleSession[];
      const courtroomId = 'courtroom-1';
      const courtRoomName = 'Courtroom A';
      const action = ViewScheduleActions.assignCourtroom({
        sessionsToAssign,
        courtroomId,
        courtRoomName
      });
      const completion = ViewScheduleActions.assignCourtroomSuccess({ courtRoomName });

      actions$ = hot('-a-', { a: action });
      const response$ = cold('-a|', { a: { errorGroups: [] } });

      viewScheduleService.assignCourtroom = jest.fn().mockReturnValueOnce(response$);

      const payload = {
        courtScheduleIds: ['id1'],
        courtRoomId: courtroomId
      };

      const expected$ = cold('--b', { b: completion });

      expect(effects.assignCourtroom$).toBeObservable(expected$);
      expect(viewScheduleService.assignCourtroom).toHaveBeenCalledWith(payload);
    });

    it('should return setErrors and setViewSessionsToAssign actions when errorGroups has items', () => {
      const sessionsToAssign = [
        { courtScheduleId: 'id1', courtRoomId: '1' }
      ] as CourtScheduleSession[];
      const courtroomId = 'courtroom-1';
      const action = ViewScheduleActions.assignCourtroom({
        sessionsToAssign,
        courtroomId,
        courtRoomName: 'Courtroom A'
      });

      actions$ = hot('-a-', { a: action });

      const failedSessions = [mockCourtScheduleSession];
      const errorMessage = 'Cannot assign courtroom to an assigned session';
      const response$ = cold('-a|', {
        a: {
          errorGroups: [{ sessions: failedSessions, error: errorMessage }]
        }
      });

      viewScheduleService.assignCourtroom = jest.fn().mockReturnValueOnce(response$);

      const expected$ = cold('--(ab)', {
        a: ViewScheduleActions.setErrors({
          errors: [
            {
              id: 'backendError',
              message: errorMessage
            }
          ]
        }),
        b: ViewScheduleActions.setViewSessionsToAssign({
          sessionsToAssign: failedSessions
        })
      });

      expect(effects.assignCourtroom$).toBeObservable(expected$);
    });

    it('should return apiError on failure', () => {
      const sessionsToAssign = [
        { courtScheduleId: 'id1', courtRoomId: '1' }
      ] as CourtScheduleSession[];
      const courtroomId = 'courtroom-1';
      const action = ViewScheduleActions.assignCourtroom({
        sessionsToAssign,
        courtroomId,
        courtRoomName: 'Courtroom A'
      });
      const error = new HttpErrorResponse({ error: 'Error' });
      const completion = apiError({ error });

      actions$ = hot('-a-', { a: action });
      const response$ = cold('-#|', {}, error);

      viewScheduleService.assignCourtroom = jest.fn().mockReturnValueOnce(response$);

      const expected$ = cold('--b', { b: completion });

      expect(effects.assignCourtroom$).toBeObservable(expected$);
      expect(viewScheduleService.assignCourtroom).toHaveBeenCalled();
    });
  });

  describe('assignCourtroomSuccess$', () => {
    it('should return clearViewSessionsToAssign and setViewBanner actions on success and navigate to VIEW_SCHEDULE page', () => {
      const action = ViewScheduleActions.assignCourtroomSuccess({});
      const banner = {
        message: 'Courtroom assigned successfully',
        bannerType: 'success',
        courtRoomName: undefined as string | undefined
      };
      const clearAction = ViewScheduleActions.clearViewSessionsToAssign();
      const successBannerAction = ViewScheduleActions.setViewBanner(banner);

      actions$ = hot('-a-', { a: action });

      const expected$ = cold('-(ab)', {
        a: clearAction,
        b: successBannerAction
      });

      expect(effects.assignCourtroomSuccess$).toBeObservable(expected$);
      expect(router.navigate).toHaveBeenCalledWith([CourtSchedulerRoutes.VIEW_SCHEDULE]);
    });
  });
});
