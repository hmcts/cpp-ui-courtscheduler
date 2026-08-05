import { RouterEffects } from '../router.effects';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { cold, hot } from 'jasmine-marbles';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterReducerState, SerializedRouterStateSnapshot } from '@ngrx/router-store';
import { HttpErrorResponse } from '@angular/common/http';
import { AppState } from '../../reducers';
import { apiError } from '../../actions/api.actions';
import { ERROR_ROUTE_PATHS } from '@cpp/application';

describe('Router Effects', () => {
  let effects: RouterEffects;
  let actions$: Observable<Action> = new Observable<Action>();
  let store: MockStore<AppState>;

  let navigate: jest.Mock;

  beforeEach(() => {
    navigate = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        RouterEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {
          provide: Router,
          useValue: {
            navigate
          }
        }
      ],
      teardown: { destroyAfterEach: false }
    });
    effects = TestBed.inject(RouterEffects);
    actions$ = TestBed.inject(Actions);
    store = TestBed.inject(MockStore);
    store.setState({
      router: {
        state: {
          url: '/test'
        } as SerializedRouterStateSnapshot
      } as RouterReducerState<SerializedRouterStateSnapshot>
    } as AppState);
  });

  describe('timeout', () => {
    it('navigates to timeout', () => {
      const error = new HttpErrorResponse({ status: 0 });
      const action = apiError({ error });
      actions$ = hot('-a', { a: action });

      const expectedError = {
        errorPath: `/${ERROR_ROUTE_PATHS.timedOutError}`,
        redirectUrl: `/courtscheduler/test`
      };

      const expected$ = cold('-b', { b: expectedError });

      expect(effects.navigateApiError$).toBeObservable(expected$);
      expect(navigate).toHaveBeenCalledWith([`/${ERROR_ROUTE_PATHS.timedOutError}`], {
        state: expectedError
      });
    });
  });

  describe('default', () => {
    it('navigates to technical-error by default', () => {
      const error = new HttpErrorResponse({ status: null });
      const action = apiError({ error });
      actions$ = hot('-a', { a: action });

      const expectedError = {
        errorPath: `/${ERROR_ROUTE_PATHS.technicalError}`,
        redirectUrl: `/courtscheduler/test`
      };

      const expected$ = cold('-b', { b: expectedError });

      expect(effects.navigateApiError$).toBeObservable(expected$);
      expect(navigate).toHaveBeenCalledWith([`/${ERROR_ROUTE_PATHS.technicalError}`], {
        state: expectedError
      });
    });
  });

  describe('403 status', () => {
    it('navigates to unauthorised-access', () => {
      const error = new HttpErrorResponse({ status: 403 });
      const action = apiError({ error });
      actions$ = hot('-a', { a: action });

      const expectedError = {
        errorPath: `/${ERROR_ROUTE_PATHS.unauthorised}`,
        redirectUrl: `/courtscheduler/test`
      };

      const expected$ = cold('-b', { b: expectedError });

      expect(effects.navigateApiError$).toBeObservable(expected$);
      expect(navigate).toHaveBeenCalledWith([`/${ERROR_ROUTE_PATHS.unauthorised}`], {
        state: expectedError
      });
    });
  });

  describe('404 status', () => {
    it('navigates to page-not-found', () => {
      const error = new HttpErrorResponse({ status: 404 });
      const action = apiError({ error });
      actions$ = hot('-a', { a: action });

      const expectedError = {
        errorPath: `/${ERROR_ROUTE_PATHS.pageNotFound}`,
        redirectUrl: `/courtscheduler/test`
      };

      const expected$ = cold('-b', { b: expectedError });

      expect(effects.navigateApiError$).toBeObservable(expected$);
      expect(navigate).toHaveBeenCalledWith([`/${ERROR_ROUTE_PATHS.pageNotFound}`], {
        state: expectedError
      });
    });
  });

  describe('401 status', () => {
    it('navigates to signed-out-error', () => {
      const error = new HttpErrorResponse({ status: 401 });
      const action = apiError({ error });
      actions$ = hot('-a', { a: action });

      const expectedError = {
        errorPath: `/${ERROR_ROUTE_PATHS.signedOutError}`,
        redirectUrl: `/courtscheduler/test`
      };

      const expected$ = cold('-b', { b: expectedError });

      expect(effects.navigateApiError$).toBeObservable(expected$);
      expect(navigate).toHaveBeenCalledWith([`/${ERROR_ROUTE_PATHS.signedOutError}`], {
        state: expectedError
      });
    });
  });
});
