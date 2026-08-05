import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { runInInjectionContext } from '@angular/core';
import { of, throwError, Observable } from 'rxjs';
import { getJudicialItineraryGuard } from '../get-judicial-itinerary.guard';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { JudicialItineraryService } from '../../services/judicial-itinerary.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Itinerary } from '../../model/judicial-itinerary.interface';
import { ExtendedJudicialMember } from '../../../../shared/model';
import { Specialism } from '@cpp/reference-data';

class MockManageJudicialItineraryStore {
  readonly selectedItinerary = jest.fn();
  readonly setSelectedItinerary = jest.fn();
  readonly setSelectedJudiciary = jest.fn();
  readonly handleError = jest.fn();
}

class MockJudicialItineraryService {
  readonly findAvailabilityById = jest.fn();
}

describe('getJudicialItineraryGuard', () => {
  let store: MockManageJudicialItineraryStore;
  let service: MockJudicialItineraryService;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  const mockJudiciary: ExtendedJudicialMember = {
    id: 'judge-1',
    seqId: 1,
    surname: 'Smith',
    forenames: 'John',
    judiciaryType: 'Circuit Judge',
    emailAddress: 'john.smith@example.com',
    specialisms: [Specialism.MURDER]
  } as unknown as ExtendedJudicialMember;

  const mockItinerary: Itinerary = {
    id: 'rule-1',
    courtHouseId: 'court-1',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    sessionType: 'AD',
    repeatDays: ['Monday'],
    unavailabilities: [],
    judiciaryMember: mockJudiciary
  };

  beforeEach(() => {
    store = new MockManageJudicialItineraryStore();
    service = new MockJudicialItineraryService();
    route = {
      params: { id: 'rule-1' }
    } as unknown as ActivatedRouteSnapshot;
    state = {} as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ManageJudicialItineraryStore,
          useValue: store
        },
        {
          provide: JudicialItineraryService,
          useValue: service
        }
      ],
      teardown: { destroyAfterEach: false }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when id is not in route params', (done) => {
    expect.assertions(1);

    route.params = {};

    const result = runInInjectionContext(TestBed, () =>
      getJudicialItineraryGuard(route, state)
    ) as Observable<boolean>;

    result.subscribe((allowed: boolean) => {
      expect(allowed).toBe(false);
      done();
    });
  });

  it('should return true when selectedItinerary exists and matches id', (done) => {
    expect.assertions(3);

    store.selectedItinerary.mockReturnValue(mockItinerary);

    const result = runInInjectionContext(TestBed, () =>
      getJudicialItineraryGuard(route, state)
    ) as Observable<boolean>;

    result.subscribe((allowed: boolean) => {
      expect(allowed).toBe(true);
      expect(service.findAvailabilityById).not.toHaveBeenCalled();
      expect(store.setSelectedItinerary).not.toHaveBeenCalled();
      done();
    });
  });

  it('should return false when selectedItinerary exists but does not match id', (done) => {
    expect.assertions(1);

    const differentItinerary: Itinerary = {
      ...mockItinerary,
      id: 'rule-2'
    };
    store.selectedItinerary.mockReturnValue(differentItinerary);
    service.findAvailabilityById.mockReturnValue(of({ itinerary: mockItinerary }));

    const result = runInInjectionContext(TestBed, () =>
      getJudicialItineraryGuard(route, state)
    ) as Observable<boolean>;

    result.subscribe((allowed: boolean) => {
      expect(allowed).toBe(true);
      done();
    });
  });

  it('should fetch itinerary from API when selectedItinerary is null', (done) => {
    expect.assertions(4);

    store.selectedItinerary.mockReturnValue(null);
    service.findAvailabilityById.mockReturnValue(of({ itinerary: mockItinerary }));

    const result = runInInjectionContext(TestBed, () =>
      getJudicialItineraryGuard(route, state)
    ) as Observable<boolean>;

    result.subscribe((allowed: boolean) => {
      expect(allowed).toBe(true);
      expect(service.findAvailabilityById).toHaveBeenCalledWith('rule-1');
      expect(store.setSelectedItinerary).toHaveBeenCalledWith(mockItinerary);
      expect(store.setSelectedJudiciary).toHaveBeenCalledWith([mockJudiciary]);
      done();
    });
  });

  it('should fetch itinerary from API when selectedItinerary is undefined', (done) => {
    expect.assertions(4);

    store.selectedItinerary.mockReturnValue(undefined);
    service.findAvailabilityById.mockReturnValue(of({ itinerary: mockItinerary }));

    const result = runInInjectionContext(TestBed, () =>
      getJudicialItineraryGuard(route, state)
    ) as Observable<boolean>;

    result.subscribe((allowed: boolean) => {
      expect(allowed).toBe(true);
      expect(service.findAvailabilityById).toHaveBeenCalledWith('rule-1');
      expect(store.setSelectedItinerary).toHaveBeenCalledWith(mockItinerary);
      expect(store.setSelectedJudiciary).toHaveBeenCalledWith([mockJudiciary]);
      done();
    });
  });

  it('should handle error and return false when API call fails', (done) => {
    expect.assertions(3);

    store.selectedItinerary.mockReturnValue(null);
    const error = new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found'
    });
    service.findAvailabilityById.mockReturnValue(throwError(() => error));

    const result = runInInjectionContext(TestBed, () =>
      getJudicialItineraryGuard(route, state)
    ) as Observable<boolean>;

    result.subscribe((allowed: boolean) => {
      expect(allowed).toBe(false);
      expect(store.handleError).toHaveBeenCalledWith(error);
      expect(store.setSelectedItinerary).not.toHaveBeenCalled();
      done();
    });
  });

  it('should handle error and return false when API call throws', (done) => {
    expect.assertions(3);

    store.selectedItinerary.mockReturnValue(null);
    const error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error'
    });
    service.findAvailabilityById.mockReturnValue(throwError(() => error));

    const result = runInInjectionContext(TestBed, () =>
      getJudicialItineraryGuard(route, state)
    ) as Observable<boolean>;

    result.subscribe((allowed: boolean) => {
      expect(allowed).toBe(false);
      expect(store.handleError).toHaveBeenCalledWith(error);
      expect(store.setSelectedItinerary).not.toHaveBeenCalled();
      done();
    });
  });

  it('should use correct id from route params', (done) => {
    expect.assertions(1);

    route.params = { id: 'rule-999' };
    store.selectedItinerary.mockReturnValue(null);
    service.findAvailabilityById.mockReturnValue(of({ itinerary: mockItinerary }));

    const result = runInInjectionContext(TestBed, () =>
      getJudicialItineraryGuard(route, state)
    ) as Observable<boolean>;

    result.subscribe(() => {
      expect(service.findAvailabilityById).toHaveBeenCalledWith('rule-999');
      done();
    });
  });
});
