import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { CppHttpBackend, GENERATE_UNIQUE_KEY, NotificationDispatcher } from '@cpp/core';
import { CPPMonitorHttp } from '../http';
import { AppState } from '../../../reducers';
import { ApiActions } from '../../../actions';
import { cold } from 'jasmine-marbles';
import { HttpResponse } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';

describe('CCE2EHttp', () => {
  let service: CPPMonitorHttp;
  let store: Store<AppState>;
  let backend: CppHttpBackend;

  const mockGenerateUniqueKey = jest.fn();

  const options = { url: 'test', requestType: 'GET' };
  const expected = new HttpResponse({ body: {}, status: 200 });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        CPPMonitorHttp,
        { provide: GENERATE_UNIQUE_KEY, useValue: mockGenerateUniqueKey },
        {
          provide: CppHttpBackend,
          useValue: {
            query: jest.fn(),
            command: jest.fn()
          }
        },
        { provide: NotificationDispatcher, useValue: {} }
      ]
    });

    service = TestBed.inject(CPPMonitorHttp);
    store = TestBed.inject(Store);
    backend = TestBed.inject(CppHttpBackend);

    spyOn(store, 'dispatch');
  });

  it('should dispatch pendingApiRequest action in handleRequest', () => {
    const expectedAction = ApiActions.pendingApiRequest({ request: options });

    service.handleRequest(options);

    expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
  });

  it('should call handleRequest in query', () => {
    spyOn(service, 'handleRequest').and.callThrough();
    backend.get = jest.fn().mockReturnValue(of(expected));

    const expected$ = cold('(a|)', { a: expected });

    expect(service.query(options)).toBeObservable(expected$);
    expect(service.handleRequest).toHaveBeenCalledWith(options);
  });

  it('should call handleRequest in command', () => {
    spyOn(service, 'handleRequest').and.callThrough();
    backend.post = jest.fn().mockReturnValue(of(expected));

    const expected$ = cold('(a|)', { a: expected });

    expect(service.command(options)).toBeObservable(expected$);
    expect(service.handleRequest).toHaveBeenCalledWith(options);
  });

  it('should dispatch completedApiRequest action in handleResponse', () => {
    const expectedAction = ApiActions.completedApiRequest({ request: options });
    const source$ = cold('(a|)', { a: expected });
    const expected$ = cold('(a|)', { a: expected });

    expect(service.handleResponse(options)(source$)).toBeObservable(expected$);
    expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
  });
});
