import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { withUpsertJudiciaryItinerary } from '../with-upsert-judiciary-itinerary.feature';
import {
  DraftItinerary,
  Itinerary,
  JudiciaryWithSpecialisms
} from '../../model/judicial-itinerary.interface';
import { SessionType } from '../../../../shared/model/session';
import { DayOfWeek } from '../../../../shared/model/days';
import { JudicialMember, OrganisationUnit } from '@cpp/reference-data';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { JudicialItineraryService } from '../../services/judicial-itinerary.service';
import { Specialism } from '../../model/specialism.enum';
import { ItinerarySearchParams } from '../manage-judiciary-itinerary.store.interfaces';

const mockJudiciary: JudicialMember = {
  id: 'judge-1',
  seqId: 1,
  surname: 'Smith',
  forenames: 'John',
  judiciaryType: 'Circuit Judge',
  emailAddress: 'john.smith@example.com'
} as unknown as JudicialMember;

const mockCourtCentre: OrganisationUnit = {
  id: 'court-1',
  oucode: 'OU001',
  oucodeL3Name: 'Test Court'
} as unknown as OrganisationUnit;

const mockJudiciaryWithSpecialisms = {
  ...mockJudiciary,
  specialisms: [Specialism.MURDER]
} as JudiciaryWithSpecialisms;

const mockItinerary: Itinerary = {
  id: 'itinerary-1',
  courtHouseId: 'court-1',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  sessionType: 'AD' as SessionType,
  repeatDays: ['Monday', 'Tuesday'],
  unavailabilities: [],
  judiciaryMember: mockJudiciaryWithSpecialisms
};

const mockSearchParams: ItinerarySearchParams = {
  courtCentre: mockCourtCentre,
  availability: {
    startDate: '2026-01-01',
    endDate: '2026-01-31'
  }
};

const TestStore = signalStore(
  withState({
    selectedJudiciary: mockJudiciary as unknown as JudiciaryWithSpecialisms | null,
    searchParams: mockSearchParams,
    selectedItinerary: null as Itinerary | null
  }),
  withMethods((store) => {
    const handleError = jest.fn();
    const clearJudiciarySelection = jest.fn();
    const setSelectedItinerary = jest.fn((it: Itinerary | null) =>
      patchState(store, { selectedItinerary: it })
    );
    const clearServerSubmissionError = jest.fn();
    return {
      handleError,
      clearJudiciarySelection,
      setSelectedItinerary,
      clearServerSubmissionError,
      setSelectedJudiciaryForTest: (j: JudiciaryWithSpecialisms | null) =>
        patchState(store, { selectedJudiciary: j })
    };
  }),
  withUpsertJudiciaryItinerary()
);

type UpsertTestStore = InstanceType<typeof TestStore>;

describe('withUpsertJudiciaryItinerary', () => {
  let store: UpsertTestStore;
  let service: jest.Mocked<JudicialItineraryService>;

  beforeEach(() => {
    const mockService = {
      addAvailability: jest.fn(),
      updateAvailability: jest.fn(),
      addSpecialisms: jest.fn(),
      validateAvailability: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        TestStore,
        {
          provide: JudicialItineraryService,
          useValue: mockService
        }
      ],
      teardown: { destroyAfterEach: false }
    });

    store = TestBed.inject(TestStore);
    service = TestBed.inject(JudicialItineraryService) as jest.Mocked<JudicialItineraryService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have initial draftItinerary state', () => {
      expect.assertions(5);

      const draftItinerary = store.draftItinerary();
      expect(draftItinerary.availability.startDate).toBeNull();
      expect(draftItinerary.availability.endDate).toBeNull();
      expect(draftItinerary.sittingDays).toEqual([]);
      expect(draftItinerary.session).toBeNull();
      expect(draftItinerary.unavailabilities).toEqual([]);
    });

    it('should have normalisedSittingDays as all weekdays when sittingDays is empty', () => {
      expect.assertions(1);

      const normalised = store.normalisedSittingDays();
      expect(normalised).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    });

    it('should have itineraryToUpdate as null when selectedItinerary is null', () => {
      expect.assertions(1);

      store.setSelectedItinerary(null);
      const itineraryToUpdate = store.editItinerary();
      expect(itineraryToUpdate).toBeNull();
    });

    it('should have itineraryToUpdate as null when selectedJudiciary is null', () => {
      expect.assertions(1);

      store.setSelectedItinerary(mockItinerary);
      store.setSelectedJudiciaryForTest(null);
      const itineraryToUpdate = store.editItinerary();
      expect(itineraryToUpdate).toBeNull();
    });

    it('should map selectedItinerary to DraftItinerary when both selectedItinerary and selectedJudiciary are available', () => {
      expect.assertions(5);

      store.setSelectedItinerary(mockItinerary);
      store.setSelectedJudiciaryForTest(mockJudiciary as unknown as JudiciaryWithSpecialisms);

      const itineraryToUpdate = store.editItinerary();

      expect(itineraryToUpdate).not.toBeNull();
      expect(itineraryToUpdate?.availability.startDate).toBe('2026-01-01');
      expect(itineraryToUpdate?.availability.endDate).toBe('2026-01-31');
      expect(itineraryToUpdate?.sittingDays).toEqual([DayOfWeek.Monday, DayOfWeek.Tuesday]);
      expect(itineraryToUpdate?.session).toBe('AD');
    });

    it('should use empty array for unavailabilities when selectedItinerary.unavailabilities is null', () => {
      expect.assertions(1);

      const itineraryWithoutUnavailabilities: Itinerary = {
        ...mockItinerary,
        unavailabilities: null as any
      };

      store.setSelectedItinerary(itineraryWithoutUnavailabilities);
      store.setSelectedJudiciaryForTest(mockJudiciary as unknown as JudiciaryWithSpecialisms);

      const itineraryToUpdate = store.editItinerary();

      expect(itineraryToUpdate?.unavailabilities).toEqual([]);
    });

    it('should use empty array for unavailabilities when selectedItinerary.unavailabilities is undefined', () => {
      expect.assertions(1);

      const itineraryWithoutUnavailabilities: Itinerary = {
        ...mockItinerary,
        unavailabilities: undefined as any
      };

      store.setSelectedItinerary(itineraryWithoutUnavailabilities);
      store.setSelectedJudiciaryForTest(mockJudiciary as unknown as JudiciaryWithSpecialisms);

      const itineraryToUpdate = store.editItinerary();

      expect(itineraryToUpdate?.unavailabilities).toEqual([]);
    });
  });

  describe('setDraftItinerary', () => {
    it('should update draftItinerary', () => {
      expect.assertions(1);

      const draft: DraftItinerary = {
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        },
        sittingDays: [DayOfWeek.Monday, DayOfWeek.Tuesday],
        session: 'AD' as SessionType
      };

      store.setDraftItinerary(draft);

      expect(store.draftItinerary()).toEqual(draft);
    });
  });

  describe('normalisedSittingDays computed', () => {
    it('should return selected days when sittingDays is not empty', () => {
      expect.assertions(1);

      store.setDraftItinerary({
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        },
        sittingDays: [DayOfWeek.Monday, DayOfWeek.Wednesday],
        session: 'AD' as SessionType
      });

      const normalised = store.normalisedSittingDays();
      expect(normalised).toEqual(['Monday', 'Wednesday']);
    });

    it('should return all weekdays when sittingDays is empty', () => {
      expect.assertions(1);

      store.setDraftItinerary({
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        },
        sittingDays: [],
        session: 'AD' as SessionType
      });

      const normalised = store.normalisedSittingDays();
      expect(normalised).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    });
  });

  describe('addItinerary', () => {
    it('should call service.addAvailability with correct payload when all data is available', fakeAsync(() => {
      expect.assertions(1);

      service.addAvailability.mockReturnValue(of({}));
      const onAddSuccessSpy = jest.fn();

      store.setDraftItinerary({
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        },
        sittingDays: [DayOfWeek.Monday, DayOfWeek.Tuesday],
        session: 'AD' as SessionType
      });

      store.addItinerary({ onAddSuccess: onAddSuccessSpy });
      tick();

      expect(service.addAvailability).toHaveBeenCalledWith({
        judiciaryId: 'judge-1',
        courtHouseId: 'court-1',
        repeatDays: ['Monday', 'Tuesday'],
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        sessionType: 'AD'
      });
    }));

    it('should call onAddSuccess callback on successful add', fakeAsync(() => {
      expect.assertions(1);

      service.addAvailability.mockReturnValue(of({}));
      const onAddSuccessSpy = jest.fn();

      store.setDraftItinerary({
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        },
        sittingDays: [DayOfWeek.Monday],
        session: 'AD' as SessionType
      });

      store.addItinerary({ onAddSuccess: onAddSuccessSpy });
      tick();

      expect(onAddSuccessSpy).toHaveBeenCalled();
    }));

    it('should call onError callback when provided on error', fakeAsync(() => {
      expect.assertions(2);

      const error = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
      service.addAvailability.mockReturnValue(throwError(() => error));
      const onErrorSpy = jest.fn();

      store.setDraftItinerary({
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        },
        sittingDays: [DayOfWeek.Monday],
        session: 'AD' as SessionType
      });

      store.addItinerary({ onError: onErrorSpy });
      tick();

      expect(onErrorSpy).toHaveBeenCalledWith(error);
      expect(store.handleError).not.toHaveBeenCalled();
    }));

    it('should call baseStore.handleError when onError callback is not provided', fakeAsync(() => {
      expect.assertions(1);

      const error = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
      service.addAvailability.mockReturnValue(throwError(() => error));

      store.setDraftItinerary({
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        },
        sittingDays: [DayOfWeek.Monday],
        session: 'AD' as SessionType
      });

      store.addItinerary({});
      tick();

      expect(store.handleError).toHaveBeenCalledWith(error);
    }));
  });

  describe('addItinerary when handleError is not provided', () => {
    const errorNoHandler = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error'
    });
    const mockServiceNoHandler = {
      addAvailability: jest.fn().mockReturnValue(throwError(() => errorNoHandler)),
      updateAvailability: jest.fn(),
      addSpecialisms: jest.fn(),
      validateAvailability: jest.fn()
    };

    const TestStoreNoHandler = signalStore(
      withState({
        selectedJudiciary: mockJudiciary as unknown as JudiciaryWithSpecialisms | null,
        searchParams: mockSearchParams,
        selectedItinerary: null as Itinerary | null
      }),
      withMethods((store) => ({
        clearJudiciarySelection: jest.fn(),
        setSelectedItinerary: jest.fn((it: Itinerary | null) =>
          patchState(store, { selectedItinerary: it })
        ),
        clearServerSubmissionError: jest.fn(),
        setSelectedJudiciaryForTest: jest.fn()
      })),
      withUpsertJudiciaryItinerary()
    );

    let storeNoHandler: UpsertTestStore;

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TestStoreNoHandler,
          { provide: JudicialItineraryService, useValue: mockServiceNoHandler }
        ],
        teardown: { destroyAfterEach: false }
      });
      storeNoHandler = TestBed.inject(TestStoreNoHandler) as unknown as UpsertTestStore;
    });

    it('should throw error when neither onError nor handleError are provided', fakeAsync(() => {
      expect.assertions(1);

      storeNoHandler.setDraftItinerary({
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        },
        sittingDays: [DayOfWeek.Monday],
        session: 'AD' as SessionType
      });

      expect(() => {
        storeNoHandler.addItinerary({});
        tick();
      }).toThrow();
    }));
  });

  describe('updateItinerary', () => {
    it('should call service.updateAvailability with correct payload when all data is available', fakeAsync(() => {
      expect.assertions(1);

      service.updateAvailability.mockReturnValue(of({}));
      service.addSpecialisms.mockReturnValue(of({ specialisms: [] }));
      store.setSelectedItinerary(mockItinerary);
      const onUpdateSuccessSpy = jest.fn();

      store.setDraftItinerary({
        availability: {
          startDate: '2026-02-01',
          endDate: '2026-02-28'
        },
        sittingDays: [DayOfWeek.Wednesday, DayOfWeek.Friday],
        session: 'AM' as SessionType,
        unavailabilities: []
      });

      store.updateItinerary({ onUpdateSuccess: onUpdateSuccessSpy });
      tick();

      expect(service.updateAvailability).toHaveBeenCalledWith({
        ruleId: 'itinerary-1',
        judiciaryId: 'judge-1',
        courtHouseId: 'court-1',
        repeatDays: ['Wednesday', 'Friday'],
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        sessionType: 'AM',
        unavailabilities: []
      });
    }));

    it('should call onUpdateSuccess callback on successful update', fakeAsync(() => {
      expect.assertions(1);

      service.updateAvailability.mockReturnValue(of({}));
      service.addSpecialisms.mockReturnValue(of({ specialisms: [] }));
      store.setSelectedItinerary(mockItinerary);
      const onUpdateSuccessSpy = jest.fn();

      store.setDraftItinerary({
        availability: {
          startDate: '2026-02-01',
          endDate: '2026-02-28'
        },
        sittingDays: [DayOfWeek.Monday],
        session: 'AD' as SessionType
      });

      store.updateItinerary({ onUpdateSuccess: onUpdateSuccessSpy });
      tick();

      expect(onUpdateSuccessSpy).toHaveBeenCalled();
    }));

    it('should call onError callback when provided on error', fakeAsync(() => {
      expect.assertions(2);

      const error = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
      service.updateAvailability.mockReturnValue(throwError(() => error));
      store.setSelectedItinerary(mockItinerary);
      const onErrorSpy = jest.fn();

      store.setDraftItinerary({
        availability: {
          startDate: '2026-02-01',
          endDate: '2026-02-28'
        },
        sittingDays: [DayOfWeek.Monday],
        session: 'AD' as SessionType
      });

      store.updateItinerary({ onError: onErrorSpy });
      tick();

      expect(onErrorSpy).toHaveBeenCalledWith(error);
      expect(store.handleError).not.toHaveBeenCalled();
    }));

    it('should call baseStore.handleError when onError callback is not provided', fakeAsync(() => {
      expect.assertions(1);

      const error = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
      service.updateAvailability.mockReturnValue(throwError(() => error));
      store.setSelectedItinerary(mockItinerary);

      store.setDraftItinerary({
        availability: {
          startDate: '2026-02-01',
          endDate: '2026-02-28'
        },
        sittingDays: [DayOfWeek.Monday],
        session: 'AD' as SessionType
      });

      store.updateItinerary({});
      tick();

      expect(store.handleError).toHaveBeenCalledWith(error);
    }));

    it('should use normalisedSittingDays (all weekdays) when sittingDays is empty', fakeAsync(() => {
      expect.assertions(1);

      service.updateAvailability.mockReturnValue(of({}));
      service.addSpecialisms.mockReturnValue(of({ specialisms: [] }));
      store.setSelectedItinerary(mockItinerary);

      store.setDraftItinerary({
        availability: {
          startDate: '2026-02-01',
          endDate: '2026-02-28'
        },
        sittingDays: [],
        session: 'AD' as SessionType
      });

      store.updateItinerary({});
      tick();

      expect(service.updateAvailability).toHaveBeenCalledWith(
        expect.objectContaining({
          repeatDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        })
      );
    }));
  });

  describe('resetUpsertJudiciaryItineraryState', () => {
    it('should reset draftItinerary to initial state', () => {
      expect.assertions(5);

      store.setDraftItinerary({
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        },
        sittingDays: [DayOfWeek.Monday],
        session: 'AD' as SessionType,
        unavailabilities: []
      });

      store.resetUpsertJudiciaryItineraryState();

      const draftItinerary = store.draftItinerary();
      expect(draftItinerary.availability.startDate).toBeNull();
      expect(draftItinerary.availability.endDate).toBeNull();
      expect(draftItinerary.sittingDays).toEqual([]);
      expect(draftItinerary.session).toBeNull();
      expect(draftItinerary.unavailabilities).toEqual([]);
    });
  });

  describe('clearUpsertItinerary', () => {
    it('should call clearJudiciarySelection, setSelectedItinerary to null, and reset draftItinerary', () => {
      expect.assertions(5);

      store.setDraftItinerary({
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        },
        sittingDays: [DayOfWeek.Monday],
        session: 'AD' as SessionType
      });

      store.clearUpsertItinerary();

      expect(store.clearJudiciarySelection).toHaveBeenCalled();
      expect(store.setSelectedItinerary).toHaveBeenCalledWith(null);
      const draftItinerary = store.draftItinerary();
      expect(draftItinerary.availability.startDate).toBeNull();
      expect(draftItinerary.availability.endDate).toBeNull();
      expect(draftItinerary.sittingDays).toEqual([]);
    });
  });

  describe('validateAddItinerary', () => {
    it('should call service.validateAvailability with correct payload and onValidateDone with undefined on success', fakeAsync(() => {
      expect.assertions(2);

      service.validateAvailability.mockReturnValue(of({}));
      const onValidateDoneSpy = jest.fn();

      store.setDraftItinerary({
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        },
        sittingDays: [DayOfWeek.Monday, DayOfWeek.Tuesday],
        session: 'AD' as SessionType
      });

      store.validateAddItinerary({ onValidateDone: onValidateDoneSpy });
      tick();

      expect(service.validateAvailability).toHaveBeenCalledWith({
        judiciaryId: 'judge-1',
        courtHouseId: 'court-1',
        repeatDays: ['Monday', 'Tuesday'],
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        sessionType: 'AD'
      });
      expect(onValidateDoneSpy).toHaveBeenCalledWith(undefined);
    }));

    it('should call onValidateDone with HttpErrorResponse on validation failure', fakeAsync(() => {
      expect.assertions(1);

      const errorResponse = new HttpErrorResponse({ status: 422, error: 'Validation failed' });
      service.validateAvailability.mockReturnValue(throwError(() => errorResponse));
      const onValidateDoneSpy = jest.fn();

      store.setDraftItinerary({
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        },
        sittingDays: [DayOfWeek.Monday],
        session: 'AD' as SessionType
      });

      store.validateAddItinerary({ onValidateDone: onValidateDoneSpy });
      tick();

      expect(onValidateDoneSpy).toHaveBeenCalledWith(errorResponse);
    }));

    it('should call onValidateDone with HttpErrorResponse on other HTTP errors', fakeAsync(() => {
      expect.assertions(1);

      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error'
      });
      service.validateAvailability.mockReturnValue(throwError(() => errorResponse));
      const onValidateDoneSpy = jest.fn();

      store.setDraftItinerary({
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        },
        sittingDays: [DayOfWeek.Monday],
        session: 'AD' as SessionType
      });

      store.validateAddItinerary({ onValidateDone: onValidateDoneSpy });
      tick();

      expect(onValidateDoneSpy).toHaveBeenCalledWith(errorResponse);
    }));
  });
});
