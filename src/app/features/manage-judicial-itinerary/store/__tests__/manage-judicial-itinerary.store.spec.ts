import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { AppState } from '../../../../core/reducers';
import { ManageJudicialItineraryStore } from '../manage-judicial-itinerary.store';
import { JudicialItineraryService } from '../../services/judicial-itinerary.service';
import { JudicialMemberNamePipe } from '@cpp/reference-data';
import { ExtractSignalStoreFeatureResult } from '../../../../shared/types/signal-test-types';
import { JudiciaryWithSpecialisms } from '../../model/judicial-itinerary.interface';
import { Specialism } from '../../model/specialism.enum';
import { ValidationError } from '@cpp/pdk';
import { ServerSubmissionErrorDTO } from '../../model/judicial-itinerary.interface';

describe('ManageJudicialItineraryStore', () => {
  let store: ExtractSignalStoreFeatureResult<typeof ManageJudicialItineraryStore>;

  beforeEach(() => {
    const mockService = {
      findAvailability: jest.fn(),
      addAvailability: jest.fn(),
      addSpecialisms: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ManageJudicialItineraryStore,
        {
          provide: JudicialItineraryService,
          useValue: mockService
        },
        JudicialMemberNamePipe,
        provideMockStore({
          initialState: {} as AppState
        })
      ],
      teardown: { destroyAfterEach: false }
    });

    store = TestBed.inject(ManageJudicialItineraryStore);
  });

  describe('clearSuccessMessage', () => {
    it('should clear successMessage to null', () => {
      expect.assertions(2);

      store.setSuccessMessage('Test message');
      expect(store.successMessage()).toBe('Test message');

      store.clearSuccessMessage();

      expect(store.successMessage()).toBeNull();
    });
  });

  describe('setSuccessMessage', () => {
    it('should set successMessage', () => {
      expect.assertions(1);

      store.setSuccessMessage('Operation successful');

      expect(store.successMessage()).toBe('Operation successful');
    });

    it('should overwrite existing successMessage', () => {
      expect.assertions(1);

      store.setSuccessMessage('First message');
      store.setSuccessMessage('Second message');

      expect(store.successMessage()).toBe('Second message');
    });
  });

  describe('setFormErrors', () => {
    it('should set formErrors', () => {
      expect.assertions(1);

      const errors: ValidationError[] = [
        {
          id: 'field1',
          message: 'Error message 1'
        },
        {
          id: 'field2',
          message: 'Error message 2'
        }
      ];

      store.setFormErrors(errors);

      expect(store.formErrors()).toEqual(errors);
    });

    it('should overwrite existing formErrors', () => {
      expect.assertions(1);

      const firstErrors: ValidationError[] = [
        {
          id: 'field1',
          message: 'Error message 1'
        }
      ];
      const secondErrors: ValidationError[] = [
        {
          id: 'field2',
          message: 'Error message 2'
        }
      ];

      store.setFormErrors(firstErrors);
      store.setFormErrors(secondErrors);

      expect(store.formErrors()).toEqual(secondErrors);
    });

    it('should set empty array when formErrors is empty', () => {
      expect.assertions(1);

      store.setFormErrors([]);

      expect(store.formErrors()).toEqual([]);
    });
  });

  describe('clearFormErrors', () => {
    it('should clear formErrors to empty array', () => {
      expect.assertions(2);

      const errors: ValidationError[] = [
        {
          id: 'field1',
          message: 'Error message 1'
        }
      ];

      store.setFormErrors(errors);
      expect(store.formErrors().length).toBe(1);

      store.clearFormErrors();

      expect(store.formErrors()).toEqual([]);
    });
  });

  describe('setServerSubmissionError', () => {
    it('should set serverSubmissionError with default isSourceForm true', () => {
      expect.assertions(4);

      const errorDTO: ServerSubmissionErrorDTO = {
        validationResult: {
          status: 'FAILURE',
          validationError: 'Server validation error'
        }
      };

      store.setServerSubmissionError(errorDTO);

      expect(store.serverSubmissionError.message()).toBe('Server validation error');
      expect(store.serverSubmissionError.isSourceForm()).toBe(true);
      expect(store.serverSubmissionError.linkText()).toBeUndefined();
      expect(store.serverSubmissionError.linkAction()).toBeUndefined();
    });

    it('should set serverSubmissionError with isSourceForm false', () => {
      expect.assertions(1);

      const errorDTO: ServerSubmissionErrorDTO = {
        validationResult: {
          status: 'FAILURE',
          validationError: 'Server validation error'
        }
      };

      store.setServerSubmissionError(errorDTO, false);

      expect(store.serverSubmissionError.isSourceForm()).toBe(false);
    });

    it('should set serverSubmissionError with linkText and linkAction', () => {
      expect.assertions(2);

      const errorDTO: ServerSubmissionErrorDTO = {
        validationResult: {
          status: 'FAILURE',
          validationError: 'Server validation error'
        }
      };
      const linkAction = jest.fn();

      store.setServerSubmissionError(errorDTO, true, 'Click here', linkAction);

      expect(store.serverSubmissionError.linkText()).toBe('Click here');
      expect(store.serverSubmissionError.linkAction()).toBe(linkAction);
    });
  });

  describe('clearServerSubmissionError', () => {
    it('should clear serverSubmissionError to initial state', () => {
      expect.assertions(4);

      const errorDTO: ServerSubmissionErrorDTO = {
        validationResult: {
          status: 'FAILURE',
          validationError: 'Server validation error'
        }
      };

      store.setServerSubmissionError(errorDTO, true, 'Click here', jest.fn());
      expect(store.serverSubmissionError.message()).toBe('Server validation error');

      store.clearServerSubmissionError();

      expect(store.serverSubmissionError.message()).toBeUndefined();
      expect(store.serverSubmissionError.isSourceForm()).toBeUndefined();
      expect(store.serverSubmissionError.linkText()).toBeUndefined();
    });
  });

  describe('resetState', () => {
    it('should reset all feature states to initial values', () => {
      expect.assertions(13);

      const mockJudiciary: JudiciaryWithSpecialisms = {
        id: 'judge-1',
        seqId: 1,
        surname: 'Smith',
        forenames: 'John',
        judiciaryType: 'Circuit Judge',
        emailAddress: 'john.smith@example.com',
        specialisms: [Specialism.MURDER]
      } as unknown as JudiciaryWithSpecialisms;

      store.setSelectedJudiciary(mockJudiciary);
      store.setSearchParams({
        courtCentre: {
          id: 'court-1',
          oucode: 'OU001'
        } as any,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      store.setCurrentPage(2);
      store.setSort('name', 'asc');
      store.setDraftSpecialisms([Specialism.MURDER]);
      store.setDraftItinerary({
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        },
        sittingDays: [],
        session: null
      });
      store.setFormErrors([
        {
          id: 'field1',
          message: 'Error message'
        }
      ]);

      store.resetState();

      expect(store.selectedType()).toBeNull();
      expect(store.selectedJudiciary()).toBeNull();
      expect(store.searchParams().courtCentre).toBeNull();
      expect(store.searchParams().availability.startDate).toBeNull();
      expect(store.searchParams().availability.endDate).toBeNull();
      expect(store.paginatedItineraries.itineraries()).toEqual(null);
      expect(store.paginatedItineraries.totalCount()).toBe(0);
      expect(store.sortField()).toBeNull();
      expect(store.sortOrder()).toBeNull();
      expect(store.draftSpecialisms()).toEqual([]);
      expect(store.draftItinerary().availability.startDate).toBeNull();
      expect(store.formErrors()).toEqual([]);
      expect(store.successMessage()).toBeNull();
    });
  });
});
