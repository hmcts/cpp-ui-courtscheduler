import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signalStore, withMethods } from '@ngrx/signals';
import { withJudiciarySpecialisms } from '../with-judiciary-specialisms.feature';
import { ExtendedJudicialMember } from '../../../../shared/model';
import { Specialism } from '@cpp/reference-data';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { JudicialItineraryService } from '../../services/judicial-itinerary.service';
import { withJudiciarySelection } from '../../../../shared/signal-store';

const mockJudiciary: ExtendedJudicialMember = {
  id: 'judge-1',
  seqId: 1,
  surname: 'Smith',
  forenames: 'John',
  judiciaryType: 'Circuit Judge',
  emailAddress: 'john.smith@example.com',
  specialisms: [Specialism.MURDER]
} as unknown as ExtendedJudicialMember;

const TestStore = signalStore(
  withJudiciarySelection(),
  withMethods(() => ({
    handleError: jest.fn(),
    navigateByUrlTo: jest.fn(),
    setSelectedItinerary: jest.fn(),
    clearServerSubmissionError: jest.fn()
  })),
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
    store.setSelectedJudiciary(mockJudiciary);
    jest.spyOn(store, 'setSelectedJudiciary');
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
      store.setDraftSpecialisms([Specialism.ATTEMPTEDMURDER]);

      const aggregated = store.aggregatedSelectedSpecialisms();
      expect(aggregated).toEqual([Specialism.ATTEMPTEDMURDER]);
    });

    it('should return empty array when selectedJudiciary is null and draft is empty', () => {
      expect.assertions(1);

      store.setSelectedJudiciary(null);
      expect(store.aggregatedSelectedSpecialisms()).toEqual([]);
    });

    it('should return only draft specialisms when selectedJudiciary has no specialisms', () => {
      expect.assertions(1);

      store.setSelectedJudiciary({
        ...mockJudiciary,
        specialisms: undefined
      } as ExtendedJudicialMember);
      store.setDraftSpecialisms([Specialism.ATTEMPTEDMURDER]);

      const aggregated = store.aggregatedSelectedSpecialisms();
      expect(aggregated).toEqual([Specialism.ATTEMPTEDMURDER]);
    });

    it('should return only draft specialisms when selectedJudiciary specialisms is null', () => {
      expect.assertions(1);

      store.setSelectedJudiciary({
        ...mockJudiciary,
        specialisms: null
      } as unknown as ExtendedJudicialMember);
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
      } as unknown as ExtendedJudicialMember);
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
      } as unknown as ExtendedJudicialMember);
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

      expect(store.firstSelectedJudiciary()?.specialisms).toEqual([Specialism.ATTEMPTEDMURDER]);
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
      jest.mocked(store.setSelectedJudiciary).mockClear();
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
