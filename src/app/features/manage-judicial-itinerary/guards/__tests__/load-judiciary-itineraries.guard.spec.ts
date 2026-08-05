import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { runInInjectionContext } from '@angular/core';
import { loadJudiciaryItineraries } from '../load-judiciary-itineraries.guard';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { OrganisationUnit } from '@cpp/reference-data';
import { signal } from '@angular/core';
import { Observable } from 'rxjs';

class MockManageJudicialItineraryStore {
  readonly searchParams = signal({
    courtCentre: null as OrganisationUnit | null,
    availability: {
      startDate: null as string | null,
      endDate: null as string | null
    }
  });
  readonly getJudicialItineraries = jest.fn();
}

describe('loadJudiciaryItineraries', () => {
  let store: MockManageJudicialItineraryStore;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    store = new MockManageJudicialItineraryStore();
    route = {} as ActivatedRouteSnapshot;
    state = {} as RouterStateSnapshot;

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

  it('should call getJudicialItineraries when searchParams are complete', () => {
    expect.assertions(2);

    const mockCourtCentre: OrganisationUnit = {
      id: 'court-1',
      oucode: 'OU001'
    } as unknown as OrganisationUnit;

    store.searchParams.set({
      courtCentre: mockCourtCentre,
      availability: {
        startDate: '2026-01-01',
        endDate: '2026-01-31'
      }
    });

    const result = runInInjectionContext(TestBed, () =>
      loadJudiciaryItineraries(route, state)
    ) as Observable<boolean>;

    result.subscribe((allowed: boolean) => {
      expect(allowed).toBe(true);
      expect(store.getJudicialItineraries).toHaveBeenCalled();
    });
  });

  it('should not call getJudicialItineraries when searchParams are incomplete', () => {
    expect.assertions(2);

    store.searchParams.set({
      courtCentre: null,
      availability: {
        startDate: null,
        endDate: null
      }
    });

    const result = runInInjectionContext(TestBed, () =>
      loadJudiciaryItineraries(route, state)
    ) as Observable<boolean>;

    result.subscribe((allowed: boolean) => {
      expect(allowed).toBe(true);
      expect(store.getJudicialItineraries).not.toHaveBeenCalled();
    });
  });

  it('should not call getJudicialItineraries when courtCentre is missing', () => {
    expect.assertions(2);

    store.searchParams.set({
      courtCentre: null,
      availability: {
        startDate: '2026-01-01',
        endDate: '2026-01-31'
      }
    });

    const result = runInInjectionContext(TestBed, () =>
      loadJudiciaryItineraries(route, state)
    ) as Observable<boolean>;

    result.subscribe((allowed: boolean) => {
      expect(allowed).toBe(true);
      expect(store.getJudicialItineraries).not.toHaveBeenCalled();
    });
  });

  it('should not call getJudicialItineraries when startDate is missing', () => {
    expect.assertions(2);

    const mockCourtCentre: OrganisationUnit = {
      id: 'court-1',
      oucode: 'OU001'
    } as unknown as OrganisationUnit;

    store.searchParams.set({
      courtCentre: mockCourtCentre,
      availability: {
        startDate: null,
        endDate: '2026-01-31'
      }
    });

    const result = runInInjectionContext(TestBed, () =>
      loadJudiciaryItineraries(route, state)
    ) as Observable<boolean>;

    result.subscribe((allowed: boolean) => {
      expect(allowed).toBe(true);
      expect(store.getJudicialItineraries).not.toHaveBeenCalled();
    });
  });

  it('should not call getJudicialItineraries when endDate is missing', () => {
    expect.assertions(2);

    const mockCourtCentre: OrganisationUnit = {
      id: 'court-1',
      oucode: 'OU001'
    } as unknown as OrganisationUnit;

    store.searchParams.set({
      courtCentre: mockCourtCentre,
      availability: {
        startDate: '2026-01-01',
        endDate: null
      }
    });

    const result = runInInjectionContext(TestBed, () =>
      loadJudiciaryItineraries(route, state)
    ) as Observable<boolean>;

    result.subscribe((allowed: boolean) => {
      expect(allowed).toBe(true);
      expect(store.getJudicialItineraries).not.toHaveBeenCalled();
    });
  });

  it('should always return true', () => {
    expect.assertions(1);

    store.searchParams.set({
      courtCentre: null,
      availability: {
        startDate: null,
        endDate: null
      }
    });

    const result = runInInjectionContext(TestBed, () =>
      loadJudiciaryItineraries(route, state)
    ) as Observable<boolean>;

    result.subscribe((allowed: boolean) => {
      expect(allowed).toBe(true);
    });
  });
});
