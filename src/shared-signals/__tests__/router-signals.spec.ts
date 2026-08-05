import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { createRouterSignals } from '../router-signals';

describe('createRouterSignals', () => {
  const params$ = new BehaviorSubject<Record<string, string>>({ sessionId: 's1' });
  const queryParams$ = new BehaviorSubject<Record<string, string>>({ tab: 'details' });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            params: params$.asObservable(),
            queryParams: queryParams$.asObservable()
          }
        }
      ],
      teardown: { destroyAfterEach: false }
    });
  });

  it('should expose route param and query param signals', () => {
    expect.assertions(4);
    TestBed.runInInjectionContext(() => {
      const s = createRouterSignals();
      expect(s.getParam('sessionId')()).toBe('s1');
      expect(s.getQueryParam('tab')()).toBe('details');
      expect(s.getParams()).toEqual({ sessionId: 's1' });
      expect(s.getQueryParams()).toEqual({ tab: 'details' });
    });
  });
});
