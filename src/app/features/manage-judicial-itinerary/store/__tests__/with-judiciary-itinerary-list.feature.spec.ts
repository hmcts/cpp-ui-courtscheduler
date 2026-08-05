import { TestBed } from '@angular/core/testing';
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { AppState } from '../../../../core/reducers';
import { withJudicialItineraryList } from '../with-judiciary-itinerary-list.feature';
import { ExtractSignalStoreFeatureResult } from '../../../../shared/types/signal-test-types';
import { OrganisationUnit } from '@cpp/reference-data';
import { of, throwError } from 'rxjs';
import { JudicialItineraryService } from '../../services/judicial-itinerary.service';
import { FindAvailabilityVM } from '../../model/judicial-itinerary.interface';
import { Specialism } from '@cpp/reference-data';
import { SortOrder } from '@cpp/pdk';
import { ItinerarySortField } from '../manage-judiciary-itinerary.store.interfaces';

describe('withJudicialItineraryList', () => {
  let store: ExtractSignalStoreFeatureResult<ReturnType<typeof withJudicialItineraryList>>;
  let service: jest.Mocked<JudicialItineraryService>;
  let mockErrorHandler: any;

  const mockOrganisationUnit: OrganisationUnit = {
    id: 'court-1',
    oucode: 'OU001',
    oucodeL3Code: 'L3',
    oucodeL3Name: 'Test Court',
    oucodeL2Code: 'L2',
    oucodeL2Name: 'Region',
    oucodeL1Code: 'L1',
    oucodeL1Name: 'Area',
    region: 'Region'
  } as OrganisationUnit;

  const mockJudiciaryMember = {
    id: 'judge-1',
    judiciaryType: 'Circuit Judge',
    specialisms: [Specialism.MURDER]
  } as any;

  const mockVMResponse: FindAvailabilityVM = {
    itineraries: [
      {
        id: 'rule-1',
        courtHouseId: 'court-1',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        sessionType: 'AD',
        repeatDays: ['Monday'],
        unavailabilities: [],
        judiciaryMember: mockJudiciaryMember
      }
    ],
    totalCount: 1,
    pageNumber: 1,
    pageSize: 20
  };

  beforeEach(() => {
    const mockService = {
      findAvailability: jest.fn()
    };

    mockErrorHandler = {
      handleError: jest.fn()
    };

    const TestStore = signalStore(
      withState({}),
      withMethods(() => ({
        handleError: (err: HttpErrorResponse) => mockErrorHandler.handleError(err)
      })),
      withJudicialItineraryList()
    );

    TestBed.configureTestingModule({
      providers: [
        TestStore,
        {
          provide: JudicialItineraryService,
          useValue: mockService
        },
        provideMockStore({
          initialState: {} as AppState
        })
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
    it('should have initial searchParams with null values', () => {
      expect.assertions(3);

      const searchParams = store.searchParams();
      expect(searchParams.courtCentre).toBeNull();
      expect(searchParams.availability.startDate).toBeNull();
      expect(searchParams.availability.endDate).toBeNull();
    });

    it('should have initial paginatedItineraries with null', () => {
      expect.assertions(4);

      expect(store.paginatedItineraries.itineraries()).toEqual(null);
      expect(store.paginatedItineraries.currentPage()).toBe(1);
      expect(store.paginatedItineraries.pageSize()).toBe(20);
      expect(store.paginatedItineraries.totalCount()).toBe(0);
    });

    it('should have initial sortField and sortOrder as null', () => {
      expect.assertions(2);

      expect(store.sortField()).toBeNull();
      expect(store.sortOrder()).toBeNull();
    });
  });

  describe('setSearchParams', () => {
    it('should update searchParams', () => {
      expect.assertions(1);

      const params = {
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      };

      store.setSearchParams(params);

      expect(store.searchParams()).toEqual(params);
    });
  });

  describe('setCurrentPage', () => {
    it('should update current page', () => {
      expect.assertions(1);

      store.setCurrentPage(2);

      expect(store.paginatedItineraries.currentPage()).toBe(2);
    });
  });

  describe('setSort', () => {
    it('should update sort field and order', () => {
      expect.assertions(2);

      const field: ItinerarySortField = 'name';
      const order: SortOrder = 'asc';

      store.setSort(field, order);

      expect(store.sortField()).toBe(field);
      expect(store.sortOrder()).toBe(order);
    });
  });

  describe('resetPaginatedItineraries', () => {
    it('should reset paginatedItineraries to initial state', () => {
      expect.assertions(4);

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(mockVMResponse));
      store.getJudicialItineraries();

      store.resetPaginatedItineraries();

      expect(store.paginatedItineraries.itineraries()).toEqual(null);
      expect(store.paginatedItineraries.currentPage()).toBe(1);
      expect(store.paginatedItineraries.totalCount()).toBe(0);
      expect(store.sortField()).toBeNull();
    });
  });

  describe('getJudicialItineraries', () => {
    it('should return empty result when search params are incomplete', () => {
      expect.assertions(2);

      store.getJudicialItineraries();

      expect(store.paginatedItineraries.itineraries()).toEqual([]);
      expect(store.paginatedItineraries.totalCount()).toBe(0);
    });

    it('should return empty result when courtCentre is missing', () => {
      expect.assertions(2);

      store.setSearchParams({
        courtCentre: null,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });

      store.getJudicialItineraries();

      expect(store.paginatedItineraries.itineraries()).toEqual([]);
      expect(store.paginatedItineraries.totalCount()).toBe(0);
    });

    it('should return empty result when startDate is missing', () => {
      expect.assertions(2);

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: null,
          endDate: '2026-01-31'
        }
      });

      store.getJudicialItineraries();

      expect(store.paginatedItineraries.itineraries()).toEqual([]);
      expect(store.paginatedItineraries.totalCount()).toBe(0);
    });

    it('should return empty result when endDate is missing', () => {
      expect.assertions(2);

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: null
        }
      });

      store.getJudicialItineraries();

      expect(store.paginatedItineraries.itineraries()).toEqual([]);
      expect(store.paginatedItineraries.totalCount()).toBe(0);
    });

    it('should fetch and update state when search params are complete', () => {
      expect.assertions(3);

      service.findAvailability.mockReturnValue(of(mockVMResponse));

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });

      store.getJudicialItineraries();

      expect(store.paginatedItineraries.itineraries()).toEqual(mockVMResponse.itineraries);
      expect(store.paginatedItineraries.totalCount()).toBe(mockVMResponse.totalCount);
      expect(store.paginatedItineraries.currentPage()).toBe(mockVMResponse.pageNumber);
    });

    it('should call service with correct parameters', () => {
      expect.assertions(1);

      service.findAvailability.mockReturnValue(of(mockVMResponse));

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      store.setCurrentPage(2);

      store.getJudicialItineraries();

      expect(service.findAvailability).toHaveBeenCalledWith({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        courtCentreId: 'court-1',
        pageNumber: 2,
        pageSize: 20
      });
    });

    it('should handle error and call errorHandler.handleError on failure', () => {
      expect.assertions(2);

      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error'
      });

      service.findAvailability.mockReturnValue(throwError(() => error));

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });

      store.getJudicialItineraries();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error);
      expect(store.paginatedItineraries.itineraries()).toEqual(null);
    });
  });

  describe('sortedItineraries computed', () => {
    it('should return unsorted itineraries when sortField is null', () => {
      expect.assertions(1);

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(mockVMResponse));
      store.getJudicialItineraries();

      const sorted = store.sortedItineraries();
      expect(sorted).toEqual(mockVMResponse.itineraries);
    });

    it('should return unsorted itineraries when sortOrder is null', () => {
      expect.assertions(1);

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(mockVMResponse));
      store.getJudicialItineraries();
      store.setSort('name', null);

      const sorted = store.sortedItineraries();
      expect(sorted).toEqual(mockVMResponse.itineraries);
    });

    it('should return unsorted itineraries when sortOrder is none', () => {
      expect.assertions(1);

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(mockVMResponse));
      store.getJudicialItineraries();
      store.setSort('name', 'none');

      const sorted = store.sortedItineraries();
      expect(sorted).toEqual(mockVMResponse.itineraries);
    });

    it('should sort by type ascending', () => {
      expect.assertions(2);

      const vmWithMultiple: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', judiciaryType: 'Circuit Judge' } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { id: 'judge-2', judiciaryType: 'District Judge' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithMultiple));
      store.getJudicialItineraries();
      store.setSort('type', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted[0].id).toBe('rule-1');
      expect(sorted[1].id).toBe('rule-2');
    });

    it('should sort by type when one judiciaryType is truthy and other is falsy', () => {
      expect.assertions(2);

      const vmWithMixed: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', judiciaryType: 'Circuit Judge' } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { id: 'judge-2', judiciaryType: '' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithMixed));
      store.getJudicialItineraries();
      store.setSort('type', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted[0].id).toBe('rule-2');
      expect(sorted[1].id).toBe('rule-1');
    });

    it('should sort by type descending', () => {
      expect.assertions(2);

      const vmWithMultiple: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', judiciaryType: 'Circuit Judge' } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { id: 'judge-2', judiciaryType: 'District Judge' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithMultiple));
      store.getJudicialItineraries();
      store.setSort('type', 'desc');

      const sorted = store.sortedItineraries();
      expect(sorted[0].id).toBe('rule-2');
      expect(sorted[1].id).toBe('rule-1');
    });

    it('should handle type sort when judiciary is not found', () => {
      expect.assertions(2);

      const vmWithoutJudiciary: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-unknown', judiciaryType: '' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithoutJudiciary));
      store.getJudicialItineraries();
      store.setSort('type', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe('rule-1');
    });

    it('should handle type sort when judiciaryType is undefined', () => {
      expect.assertions(2);

      const vmWithUndefinedType: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', judiciaryType: undefined } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { id: 'judge-2', judiciaryType: 'Circuit Judge' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithUndefinedType));
      store.getJudicialItineraries();
      store.setSort('type', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(2);
      expect(sorted[0].id).toBe('rule-1');
    });

    it('should handle type sort when judiciaryType is null', () => {
      expect.assertions(2);

      const vmWithNullType: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', judiciaryType: null as any } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { id: 'judge-2', judiciaryType: 'Circuit Judge' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithNullType));
      store.getJudicialItineraries();
      store.setSort('type', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(2);
      expect(sorted[0].id).toBe('rule-1');
    });

    it('should handle type sort when judiciaryType is empty string', () => {
      expect.assertions(2);

      const vmWithEmptyType: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', judiciaryType: '' } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { id: 'judge-2', judiciaryType: 'Circuit Judge' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithEmptyType));
      store.getJudicialItineraries();
      store.setSort('type', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(2);
      expect(sorted[0].id).toBe('rule-1');
    });

    it('should sort by name ascending', () => {
      expect.assertions(2);

      const vmWithMultiple: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', surname: 'Smith', forenames: 'John' } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { id: 'judge-2', surname: 'Brown', forenames: 'Jane' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithMultiple));
      store.getJudicialItineraries();
      store.setSort('name', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted[0].id).toBe('rule-2');
      expect(sorted[1].id).toBe('rule-1');
    });

    it('should sort by name when one has name and other has empty name', () => {
      expect.assertions(2);

      const vmWithMixed: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', surname: 'Smith', forenames: 'John' } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { id: 'judge-2', surname: '', forenames: '' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithMixed));
      store.getJudicialItineraries();
      store.setSort('name', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted[0].id).toBe('rule-2');
      expect(sorted[1].id).toBe('rule-1');
    });

    it('should sort by name descending', () => {
      expect.assertions(2);

      const vmWithMultiple: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', surname: 'Smith', forenames: 'John' } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { id: 'judge-2', surname: 'Brown', forenames: 'Jane' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithMultiple));
      store.getJudicialItineraries();
      store.setSort('name', 'desc');

      const sorted = store.sortedItineraries();
      expect(sorted[0].id).toBe('rule-1');
      expect(sorted[1].id).toBe('rule-2');
    });

    it('should handle name sort when judiciary is not found', () => {
      expect.assertions(2);

      const vmWithoutJudiciary: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-unknown' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithoutJudiciary));
      store.getJudicialItineraries();
      store.setSort('name', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe('rule-1');
    });

    it('should handle name sort when one judiciary is found and other is not', () => {
      expect.assertions(2);

      const vmWithMixed: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', surname: 'Smith', forenames: 'John' } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { id: 'judge-unknown' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithMixed));
      store.getJudicialItineraries();
      store.setSort('name', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(2);
      expect(sorted[0].id).toBe('rule-2');
    });

    it('should handle name sort when first has judiciary and second does not', () => {
      expect.assertions(3);

      const vmWithFirstFound: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', surname: 'Zebra', forenames: 'Test' } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { id: 'judge-not-found' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithFirstFound));
      store.getJudicialItineraries();
      store.setSort('name', 'desc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(2);
      expect(sorted[0].id).toBe('rule-1');
      expect(sorted[1].id).toBe('rule-2');
    });

    it('should handle name sort when surname or forenames are missing', () => {
      expect.assertions(2);

      const vmWithPartialName: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', surname: 'Smith', forenames: undefined } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithPartialName));
      store.getJudicialItineraries();
      store.setSort('name', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe('rule-1');
    });

    it('should handle name sort when surname is undefined', () => {
      expect.assertions(2);

      const vmWithUndefinedSurname: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', surname: undefined, forenames: 'John' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithUndefinedSurname));
      store.getJudicialItineraries();
      store.setSort('name', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe('rule-1');
    });

    it('should handle name sort when both surname and forenames are missing', () => {
      expect.assertions(2);

      const vmWithBothMissing: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', surname: undefined, forenames: undefined } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithBothMissing));
      store.getJudicialItineraries();
      store.setSort('name', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe('rule-1');
    });

    it('should handle name sort when surname is empty string', () => {
      expect.assertions(2);

      const vmWithEmptySurname: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', surname: '', forenames: 'John' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithEmptySurname));
      store.getJudicialItineraries();
      store.setSort('name', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe('rule-1');
    });

    it('should handle name sort when forenames is empty string', () => {
      expect.assertions(2);

      const vmWithEmptyForenames: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', surname: 'Smith', forenames: '' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithEmptyForenames));
      store.getJudicialItineraries();
      store.setSort('name', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe('rule-1');
    });

    it('should handle name sort when both surname and forenames are empty strings', () => {
      expect.assertions(2);

      const vmWithBothEmpty: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', surname: '', forenames: '' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithBothEmpty));
      store.getJudicialItineraries();
      store.setSort('name', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe('rule-1');
    });

    it('should sort by specialism ascending', () => {
      expect.assertions(2);

      const vmWithMultiple: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: [Specialism.ATTEMPTEDMURDER] }
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: [Specialism.MURDER] }
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithMultiple));
      store.getJudicialItineraries();
      store.setSort('specialism', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted[0].id).toBe('rule-1');
      expect(sorted[1].id).toBe('rule-2');
    });

    it('should sort by specialism when one has specialism and other is empty', () => {
      expect.assertions(2);

      const vmWithMixed: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: [Specialism.MURDER] }
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: [] }
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithMixed));
      store.getJudicialItineraries();
      store.setSort('specialism', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted[0].id).toBe('rule-2');
      expect(sorted[1].id).toBe('rule-1');
    });

    it('should sort by specialism descending', () => {
      expect.assertions(2);

      const vmWithMultiple: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: [Specialism.ATTEMPTEDMURDER] }
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: [Specialism.MURDER] }
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithMultiple));
      store.getJudicialItineraries();
      store.setSort('specialism', 'desc');

      const sorted = store.sortedItineraries();
      expect(sorted[0].id).toBe('rule-2');
      expect(sorted[1].id).toBe('rule-1');
    });

    it('should handle specialism sort when specialism is empty', () => {
      expect.assertions(2);

      const vmWithEmptySpecialism: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: [] }
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithEmptySpecialism));
      store.getJudicialItineraries();
      store.setSort('specialism', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe('rule-1');
    });

    it('should handle specialism sort when specialism is undefined', () => {
      expect.assertions(2);

      const vmWithUndefinedSpecialism: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: undefined as any }
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithUndefinedSpecialism));
      store.getJudicialItineraries();
      store.setSort('specialism', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe('rule-1');
    });

    it('should handle specialism sort when specialism is null', () => {
      expect.assertions(2);

      const vmWithNullSpecialism: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: null as any }
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithNullSpecialism));
      store.getJudicialItineraries();
      store.setSort('specialism', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe('rule-1');
    });

    it('should handle specialism sort when one has specialism and other is null', () => {
      expect.assertions(2);

      const vmWithMixed: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: [Specialism.MURDER] }
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: null as any }
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithMixed));
      store.getJudicialItineraries();
      store.setSort('specialism', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(2);
      expect(sorted[0].id).toBe('rule-2');
    });

    it('should handle specialism sort when first has specialism and second is empty', () => {
      expect.assertions(3);

      const vmWithFirstHasSpecialism: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: [Specialism.MURDER] }
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: [] }
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithFirstHasSpecialism));
      store.getJudicialItineraries();
      store.setSort('specialism', 'desc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(2);
      expect(sorted[0].id).toBe('rule-1');
      expect(sorted[1].id).toBe('rule-2');
    });

    it('should handle specialism sort when comparing items where b specialism is falsy', () => {
      expect.assertions(2);

      const vmForBSpecialism: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: [Specialism.ATTEMPTEDMURDER] }
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: [] }
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmForBSpecialism));
      store.getJudicialItineraries();
      store.setSort('specialism', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted[0].id).toBe('rule-2');
      expect(sorted[1].id).toBe('rule-1');
    });

    it('should handle specialism sort with multiple items where b specialism is falsy in comparisons', () => {
      expect.assertions(3);

      const vmWithMultiple: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: [Specialism.MURDER] }
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: [] }
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-3',
            judiciaryMember: { ...mockJudiciaryMember, specialisms: [Specialism.ATTEMPTEDMURDER] }
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithMultiple));
      store.getJudicialItineraries();
      store.setSort('specialism', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(3);
      expect(sorted[0].id).toBe('rule-2');
      expect(sorted[1].id).toBe('rule-3');
    });

    it('should handle name sort when bJudiciary is falsy in comparison', () => {
      expect.assertions(2);

      const vmForBJudiciary: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', surname: 'Zebra', forenames: 'Alpha' } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { id: 'judge-not-in-list' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmForBJudiciary));
      store.getJudicialItineraries();
      store.setSort('name', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted[0].id).toBe('rule-2');
      expect(sorted[1].id).toBe('rule-1');
    });

    it('should handle name sort when comparing where a has judiciary and b does not', () => {
      expect.assertions(2);

      const vmForBName: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', surname: 'Aaa', forenames: 'First' } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { id: 'judge-missing-b' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmForBName));
      store.getJudicialItineraries();
      store.setSort('name', 'desc');

      const sorted = store.sortedItineraries();
      expect(sorted[0].id).toBe('rule-1');
      expect(sorted[1].id).toBe('rule-2');
    });

    it('should handle name sort when bJudiciary ternary false branch is taken', () => {
      expect.assertions(2);

      const vmForBTernary: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', surname: 'Smith', forenames: 'John' } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { id: 'judge-not-found' } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-3',
            judiciaryMember: { id: 'judge-2', surname: 'Brown', forenames: 'Jane' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmForBTernary));
      store.getJudicialItineraries();
      store.setSort('name', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted[0].id).toBe('rule-2');
      expect(sorted[1].id).toBe('rule-3');
    });

    it('should handle equal values in sort comparison', () => {
      expect.assertions(1);

      const vmWithEqualValues: FindAvailabilityVM = {
        ...mockVMResponse,
        itineraries: [
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-1',
            judiciaryMember: { id: 'judge-1', judiciaryType: 'Circuit Judge' } as any
          },
          {
            ...mockVMResponse.itineraries[0],
            id: 'rule-2',
            judiciaryMember: { id: 'judge-1', judiciaryType: 'Circuit Judge' } as any
          }
        ]
      };

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(vmWithEqualValues));
      store.getJudicialItineraries();
      store.setSort('type', 'asc');

      const sorted = store.sortedItineraries();
      expect(sorted).toHaveLength(2);
    });
  });

  describe('resetItineraryListState', () => {
    it('should reset paginatedItineraries, sortField, and sortOrder to initial state', () => {
      expect.assertions(4);

      store.setSearchParams({
        courtCentre: mockOrganisationUnit,
        availability: {
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        }
      });
      service.findAvailability.mockReturnValue(of(mockVMResponse));
      store.getJudicialItineraries();
      store.setCurrentPage(2);
      store.setSort('name', 'asc');

      store.resetItineraryListState();

      expect(store.paginatedItineraries.itineraries()).toEqual(null);
      expect(store.paginatedItineraries.totalCount()).toBe(0);
      expect(store.sortField()).toBeNull();
      expect(store.sortOrder()).toBeNull();
    });
  });

  describe('setSelectedItinerary', () => {
    it('should set selectedItinerary to the provided itinerary', () => {
      expect.assertions(1);

      const itinerary = mockVMResponse.itineraries[0];
      store.setSelectedItinerary(itinerary);

      expect(store.selectedItinerary()).toEqual(itinerary);
    });

    it('should set selectedItinerary to null', () => {
      expect.assertions(1);

      const itinerary = mockVMResponse.itineraries[0];
      store.setSelectedItinerary(itinerary);
      store.setSelectedItinerary(null);

      expect(store.selectedItinerary()).toBeNull();
    });
  });
});
