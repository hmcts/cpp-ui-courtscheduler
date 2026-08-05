import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { staleSessionGuardFactory, StaleSessionState } from '../stale-session.guard';

describe('staleSessionGuardFactory', () => {
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;
  let mockRouter: { navigate: jest.Mock };

  beforeEach(() => {
    mockRouter = { navigate: jest.fn() };
    route = {} as ActivatedRouteSnapshot;
    state = {} as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: mockRouter }],
      teardown: { destroyAfterEach: false }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when predicate returns false', () => {
    it('should navigate to /stale-session with the provided state', () => {
      const guard = staleSessionGuardFactory(() => false, '/some-route', 'Some route label');

      const result = TestBed.runInInjectionContext(() => guard(route, state));

      const expectedState: StaleSessionState = {
        redirectLink: '/some-route',
        redirectLabel: 'Some route label'
      };
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/stale-session'], {
        state: expectedState
      });
      expect(result).toBe(false);
    });

    it('should pass through redirectLink and redirectLabel from factory args to router state', () => {
      const guard = staleSessionGuardFactory(() => false, '/another-route', 'Another label');

      TestBed.runInInjectionContext(() => guard(route, state));

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/stale-session'], {
        state: { redirectLink: '/another-route', redirectLabel: 'Another label' }
      });
    });
  });

  describe('when predicate returns true', () => {
    it('should return true and not navigate', () => {
      const guard = staleSessionGuardFactory(() => true, '/some-route', 'Some label');

      const result = TestBed.runInInjectionContext(() => guard(route, state));

      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('when predicate uses inject()', () => {
    it('should resolve injected dependencies because the guard runs in Angular injection context', () => {
      const mockService = { isValid: jest.fn().mockReturnValue(false) };

      class MockService {
        isValid = mockService.isValid;
      }

      TestBed.configureTestingModule({
        providers: [
          { provide: Router, useValue: mockRouter },
          { provide: MockService, useValue: mockService }
        ],
        teardown: { destroyAfterEach: false }
      });

      const guard = staleSessionGuardFactory(
        () => {
          const service = TestBed.inject(MockService);
          return service.isValid();
        },
        '/some-route',
        'Some label'
      );

      // Demonstrates that inject() inside predicate works without runInInjectionContext wrapper
      const result = TestBed.runInInjectionContext(() => guard(route, state));

      expect(mockService.isValid).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
