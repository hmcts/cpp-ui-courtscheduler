import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { withJudiciarySpecialisms } from '../with-judiciary-specialisms.feature';
import { JudiciaryWithSpecialisms } from '../../model/judicial-itinerary.interface';
import { Specialism } from '../../model/specialism.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { JudicialItineraryService } from '../../services/judicial-itinerary.service';

const mockJudiciary: JudiciaryWithSpecialisms = {
  id: 'judge-1',
  seqId: 1,
  surname: 'Smith',
  forenames: 'John',
  judiciaryType: 'Circuit Judge',
  emailAddress: 'john.smith@example.com',
  specialisms: [Specialism.MURDER]
} as unknown as JudiciaryWithSpecialisms;

let selectedJudiciarySpecialismsSignal = signal<Specialism[]>([Specialism.MURDER]);

const TestStore = signalStore(
  withState({
    selectedJudiciary: mockJudiciary as JudiciaryWithSpecialisms | null
  }),
  withComputed(() => ({
    selectedJudiciarySpecialisms: selectedJudiciarySpecialismsSignal
  })),
  withMethods((store) => {
    const setSelectedJudiciary = jest.fn((j: JudiciaryWithSpecialisms | null) =>
      patchState(store, { selectedJudiciary: j })
    );
    const navigateByUrlTo = jest.fn();
    const handleError = jest.fn();
    return {
      handleError,
      setSelectedJudiciary,
      setSelectedJudiciarySpecialisms: (s: Specialism[]) =>
        selectedJudiciarySpecialismsSignal.set(s),
      navigateByUrlTo,
      clearJudiciarySelection: jest.fn(),
      setSelectedItinerary: jest.fn(),
      clearServerSubmissionError: jest.fn()
    };
  }),
  withJudiciarySpecialisms()
);

type SpecialismsTestStore = InstanceType<typeof TestStore>;

describe('withJudiciarySpecialisms', () => {
  let store: SpecialismsTestStore;
  let service: jest.Mocked<JudicialItineraryService>;

  beforeEach(() => {
    const mockService = {
      addSpecialisms: jest.fn()
    };
    selectedJudiciarySpecialismsSignal.set([Specialism.MURDER]);

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
    it('should have initial draftSpecialisms as empty array', () => {
      expect.assertions(1);
      expect(store.draftSpecialisms()).toEqual([]);
    });

    it('should have initial specialismAddedSuccess as false', () => {
      expect.assertions(1);
      expect(store.specialismAddedSuccess()).toBe(false);
    });
  });

  describe('aggregatedSelectedSpecialisms computed', () => {
    it('should combine existing and draft specialisms', () => {
      expect.assertions(1);

      store.setDraftSpecialisms([Specialism.ATTEMPTEDMURDER]);

      const aggregated = store.aggregatedSelectedSpecialisms();
      expect(aggregated).toEqual([Specialism.MURDER, Specialism.ATTEMPTEDMURDER]);
    });

    it('should return only existing specialisms when draft is empty', () => {
      expect.assertions(1);
      expect(store.aggregatedSelectedSpecialisms()).toEqual([Specialism.MURDER]);
    });

    it('should return only draft specialisms when selectedJudiciary is null', () => {
      expect.assertions(1);

      store.setSelectedJudiciary(null);
      store.setSelectedJudiciarySpecialisms([]);
      store.setDraftSpecialisms([Specialism.ATTEMPTEDMURDER]);

      const aggregated = store.aggregatedSelectedSpecialisms();
      expect(aggregated).toEqual([Specialism.ATTEMPTEDMURDER]);
    });

    it('should return empty array when selectedJudiciary is null and draft is empty', () => {
      expect.assertions(1);

      store.setSelectedJudiciary(null);
      store.setSelectedJudiciarySpecialisms([]);
      expect(store.aggregatedSelectedSpecialisms()).toEqual([]);
    });

    it('should return only draft specialisms when selectedJudiciary has no specialisms', () => {
      expect.assertions(1);

      store.setSelectedJudiciary({
        ...mockJudiciary,
        specialisms: undefined
      } as JudiciaryWithSpecialisms);
      store.setSelectedJudiciarySpecialisms([]);
      store.setDraftSpecialisms([Specialism.ATTEMPTEDMURDER]);

      const aggregated = store.aggregatedSelectedSpecialisms();
      expect(aggregated).toEqual([Specialism.ATTEMPTEDMURDER]);
    });

    it('should return only draft specialisms when selectedJudiciary specialisms is null', () => {
      expect.assertions(1);

      store.setSelectedJudiciary({
        ...mockJudiciary,
        specialisms: null
      } as unknown as JudiciaryWithSpecialisms);
      store.setSelectedJudiciarySpecialisms([]);
      store.setDraftSpecialisms([Specialism.ATTEMPTEDMURDER]);

      const aggregated = store.aggregatedSelectedSpecialisms();
      expect(aggregated).toEqual([Specialism.ATTEMPTEDMURDER]);
    });
  });

  describe('setDraftSpecialisms', () => {
    it('should update draftSpecialisms', () => {
      expect.assertions(1);

      const specialisms = [Specialism.ATTEMPTEDMURDER, Specialism.SEXUALOFFENCE];
      store.setDraftSpecialisms(specialisms);

      expect(store.draftSpecialisms()).toEqual(specialisms);
    });
  });

  describe('clearSpecialismAddedSuccess', () => {
    it('should reset specialismAddedSuccess to false', () => {
      expect.assertions(1);

      store.setDraftSpecialisms([Specialism.ATTEMPTEDMURDER]);
      service.addSpecialisms.mockReturnValue(of({ specialisms: [Specialism.ATTEMPTEDMURDER] }));
      store.addSpecialisms({});

      store.clearSpecialismAddedSuccess();

      expect(store.specialismAddedSuccess()).toBe(false);
    });
  });

  describe('addSpecialisms', () => {
    it('should call service.addSpecialisms with correct parameters', fakeAsync(() => {
      expect.assertions(1);

      service.addSpecialisms.mockReturnValue(of({ specialisms: [Specialism.ATTEMPTEDMURDER] }));
      store.setDraftSpecialisms([Specialism.ATTEMPTEDMURDER]);

      store.addSpecialisms({});
      tick();

      expect(service.addSpecialisms).toHaveBeenCalledWith('judge-1', [
        Specialism.MURDER,
        Specialism.ATTEMPTEDMURDER
      ]);
    }));

    it('should not call service when selectedJudiciary is null', fakeAsync(() => {
      expect.assertions(1);

      store.setSelectedJudiciary(null);
      service.addSpecialisms.mockReturnValue(of({ specialisms: [] }));

      store.addSpecialisms({});
      tick();

      expect(service.addSpecialisms).not.toHaveBeenCalled();
    }));

    it('should not call service when selectedJudiciary has no id', fakeAsync(() => {
      expect.assertions(1);

      store.setSelectedJudiciary({
        ...mockJudiciary,
        id: undefined
      } as unknown as JudiciaryWithSpecialisms);
      service.addSpecialisms.mockReturnValue(of({ specialisms: [] }));

      store.addSpecialisms({});
      tick();

      expect(service.addSpecialisms).not.toHaveBeenCalled();
    }));

    it('should not call service when selectedJudiciary id is null', fakeAsync(() => {
      expect.assertions(1);

      store.setSelectedJudiciary({
        ...mockJudiciary,
        id: null
      } as unknown as JudiciaryWithSpecialisms);
      service.addSpecialisms.mockReturnValue(of({ specialisms: [] }));

      store.addSpecialisms({});
      tick();

      expect(service.addSpecialisms).not.toHaveBeenCalled();
    }));

    it('should update selectedJudiciary and clear draftSpecialisms on success', fakeAsync(() => {
      expect.assertions(2);

      service.addSpecialisms.mockReturnValue(of({ specialisms: [Specialism.ATTEMPTEDMURDER] }));
      store.setDraftSpecialisms([Specialism.ATTEMPTEDMURDER]);

      store.addSpecialisms({});
      tick();

      expect(store.setSelectedJudiciary).toHaveBeenCalled();
      expect(store.draftSpecialisms()).toEqual([]);
    }));

    it('should navigate to referrer if provided on success', fakeAsync(() => {
      expect.assertions(1);

      service.addSpecialisms.mockReturnValue(of({ specialisms: [] }));
      store.setDraftSpecialisms([Specialism.ATTEMPTEDMURDER]);

      store.addSpecialisms({ referrer: '/previous-url' });
      tick();

      expect(store.navigateByUrlTo).toHaveBeenCalledWith('/previous-url');
    }));

    it('should handle error and call baseStore.handleError on failure', fakeAsync(() => {
      expect.assertions(2);

      const error = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
      service.addSpecialisms.mockReturnValue(throwError(() => error));

      store.setDraftSpecialisms([Specialism.ATTEMPTEDMURDER]);
      store.addSpecialisms({});
      tick();

      expect(store.handleError).toHaveBeenCalledWith(error);
      expect(store.setSelectedJudiciary).not.toHaveBeenCalled();
    }));
  });

  describe('resetJudiciarySpecialismsState', () => {
    it('should reset draftSpecialisms and specialismAddedSuccess to initial state', () => {
      expect.assertions(2);

      store.setDraftSpecialisms([Specialism.ATTEMPTEDMURDER]);
      service.addSpecialisms.mockReturnValue(of({ specialisms: [] }));
      store.addSpecialisms({});

      store.resetJudiciarySpecialismsState();

      expect(store.draftSpecialisms()).toEqual([]);
      expect(store.specialismAddedSuccess()).toBe(false);
    });
  });
});
