import { TestBed } from '@angular/core/testing';
import { signalStore, withState } from '@ngrx/signals';
import { Store } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { apiError } from '../../../core/actions/api.actions';
import { AppState } from '../../../core/reducers';
import { withErrorHandlerAdapter } from '..';
import { ExtractSignalStoreFeatureResult } from '../../types/signal-test-types';

describe('withErrorHandlerAdapter', () => {
  let store: ExtractSignalStoreFeatureResult<ReturnType<typeof withErrorHandlerAdapter>>;
  let globalStore: Store<AppState>;

  beforeEach(() => {
    const TestStore = signalStore(withState({}), withErrorHandlerAdapter());

    TestBed.configureTestingModule({
      providers: [
        TestStore,
        provideMockStore({
          initialState: {} as AppState
        })
      ],
      teardown: { destroyAfterEach: false }
    });

    store = TestBed.inject(TestStore);
    globalStore = TestBed.inject(Store<AppState>);
  });

  it('should create store with handleError method', () => {
    expect.assertions(2);
    expect(store.handleError).toBeDefined();
    expect(typeof store.handleError).toBe('function');
  });

  it('should dispatch apiError action when handleError is called', () => {
    expect.assertions(1);

    const dispatchSpy = jest.spyOn(globalStore, 'dispatch');
    const error = new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found'
    });

    store.handleError(error);

    expect(dispatchSpy).toHaveBeenCalledWith(apiError({ error }));
  });

  it('should dispatch apiError action with correct error for different status codes', () => {
    expect.assertions(3);

    const dispatchSpy = jest.spyOn(globalStore, 'dispatch');

    const error403 = new HttpErrorResponse({
      status: 403,
      statusText: 'Forbidden'
    });

    const error500 = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error'
    });

    const error401 = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized'
    });

    store.handleError(error403);
    expect(dispatchSpy).toHaveBeenCalledWith(apiError({ error: error403 }));

    store.handleError(error500);
    expect(dispatchSpy).toHaveBeenCalledWith(apiError({ error: error500 }));

    store.handleError(error401);
    expect(dispatchSpy).toHaveBeenCalledWith(apiError({ error: error401 }));
  });
});
