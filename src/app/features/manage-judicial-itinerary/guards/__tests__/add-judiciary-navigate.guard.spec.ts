import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  createUrlTreeFromSnapshot,
  UrlTree
} from '@angular/router';
import { adJudiciaryNavigateGuard } from '../add-judiciary-navigate.guard';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { OrganisationUnit } from '@cpp/reference-data';
import { signal } from '@angular/core';
import { Observable } from 'rxjs';
import { JudicialItineraryRoutes } from '../../manage-judicial-itinerary.routes';
import { cold } from 'jasmine-marbles';

jest.mock('@angular/router', () => ({
  ...jest.requireActual('@angular/router'),
  createUrlTreeFromSnapshot: jest.fn()
}));

class MockManageJudicialItineraryStore {
  readonly searchParams = signal({
    courtCentre: null as OrganisationUnit | null,
    startDate: null as string | null,
    endDate: null as string | null
  });
}

describe('adJudiciaryNavigateGuard', () => {
  let store: MockManageJudicialItineraryStore;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;
  const mockUrlTree = {
    toString: () => `../${JudicialItineraryRoutes.REFRESH_NAVIGATE}`
  } as UrlTree;

  beforeEach(() => {
    store = new MockManageJudicialItineraryStore();
    route = {
      routeConfig: {
        path: 'test'
      },
      url: [],
      params: {},
      queryParams: {},
      fragment: null,
      data: {},
      outlet: 'primary',
      component: null,
      firstChild: null,
      children: [],
      parent: null,
      root: {} as ActivatedRouteSnapshot,
      pathFromRoot: []
    } as ActivatedRouteSnapshot;

    state = {} as RouterStateSnapshot;

    (createUrlTreeFromSnapshot as jest.Mock).mockReturnValue(mockUrlTree);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ManageJudicialItineraryStore,
          useValue: store
        }
      ],
      teardown: { destroyAfterEach: false }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when searchParams is null', () => {
    beforeEach(() => {
      const nullStore = {
        searchParams: signal(null)
      } as any;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          {
            provide: ManageJudicialItineraryStore,
            useValue: nullStore
          }
        ],
        teardown: { destroyAfterEach: false }
      });
    });

    it('should return UrlTree redirecting to REFRESH_NAVIGATE', () => {
      expect.assertions(2);

      const result = TestBed.runInInjectionContext(() =>
        adJudiciaryNavigateGuard(route, state)
      ) as UrlTree;

      expect(result).toBe(mockUrlTree);
      expect(createUrlTreeFromSnapshot).toHaveBeenCalledWith(route, [
        '../',
        JudicialItineraryRoutes.REFRESH_NAVIGATE
      ]);
    });
  });

  it('should return UrlTree redirecting to REFRESH_NAVIGATE when searchParams.courtCentre is null', () => {
    expect.assertions(2);

    store.searchParams.set({
      courtCentre: null,
      startDate: '2026-01-01',
      endDate: '2026-01-31'
    });

    const result = TestBed.runInInjectionContext(() =>
      adJudiciaryNavigateGuard(route, state)
    ) as UrlTree;

    expect(result).toBe(mockUrlTree);
    expect(createUrlTreeFromSnapshot).toHaveBeenCalledWith(route, [
      '../',
      JudicialItineraryRoutes.REFRESH_NAVIGATE
    ]);
  });

  it('should return true when searchParams.courtCentre exists', () => {
    const mockCourtCentre: OrganisationUnit = {
      id: 'court-1',
      oucode: 'OU001'
    } as unknown as OrganisationUnit;

    store.searchParams.set({
      courtCentre: mockCourtCentre,
      startDate: '2026-01-01',
      endDate: '2026-01-31'
    });

    const result = TestBed.runInInjectionContext(() =>
      adJudiciaryNavigateGuard(route, state)
    ) as Observable<boolean>;
    const expected = cold('(a|)', { a: true });

    expect(result).toBeObservable(expected);
  });
});
