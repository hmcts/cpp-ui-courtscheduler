import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CppHttp } from '@cpp/core';
import { JudicialItineraryService } from '../judicial-itinerary.service';
import {
  FindAvailabilityParams,
  FindAvailabilityDtoResponse,
  FindAvailabilityVM
} from '../../model/judicial-itinerary.interface';
import { ExtendedJudicialMember } from '../../../../shared/model';
import { Specialism } from '@cpp/reference-data';
import { SessionType } from '../../../../shared/model';
import { Unavailability } from '../../model/unavailability.interface';

describe('JudicialItineraryService', () => {
  let service: JudicialItineraryService;
  let cppHttp: jest.Mocked<CppHttp>;

  const mockParams: FindAvailabilityParams = {
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    courtCentreId: 'court-1',
    pageNumber: 1,
    pageSize: 20
  };

  const mockDtoResponse: FindAvailabilityDtoResponse = {
    rules: [
      {
        id: 'rule-1',
        judiciaryId: 'judge-1',
        courtHouseId: 'court-1',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        sessionType: 'AD',
        repeatDays: ['Monday'],
        unavailabilities: [] as Unavailability[]
      }
    ],
    judiciaries: [
      {
        id: 'judge-1',
        seqId: 1,
        surname: 'Smith',
        forenames: 'John',
        judiciaryType: 'Circuit Judge',
        specialisms: [Specialism.MURDER, Specialism.ATTEMPTEDMURDER]
      } as ExtendedJudicialMember
    ],
    totalCount: 1,
    pageNumber: 1,
    pageSize: 20
  };

  const expectedJudiciaryMember: ExtendedJudicialMember = {
    id: 'judge-1',
    seqId: 1,
    surname: 'Smith',
    forenames: 'John',
    judiciaryType: 'Circuit Judge',
    specialisms: [Specialism.MURDER, Specialism.ATTEMPTEDMURDER]
  } as ExtendedJudicialMember;

  const expectedVMResponse: FindAvailabilityVM = {
    itineraries: [
      {
        id: 'rule-1',
        courtHouseId: 'court-1',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        sessionType: 'AD',
        repeatDays: ['Monday'],
        unavailabilities: [] as Unavailability[],
        judiciaryMember: expectedJudiciaryMember
      }
    ],
    totalCount: 1,
    pageNumber: 1,
    pageSize: 20
  };

  beforeEach(() => {
    const mockCppHttp = {
      query: jest.fn(),
      command: jest.fn(),
      commandSync: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        JudicialItineraryService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: CppHttp,
          useValue: mockCppHttp
        }
      ],
      teardown: { destroyAfterEach: false }
    });

    service = TestBed.inject(JudicialItineraryService);
    cppHttp = TestBed.inject(CppHttp) as jest.Mocked<CppHttp>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect.assertions(1);
    expect(service).toBeTruthy();
  });

  it('should call CppHttp.query with correct parameters', () => {
    expect.assertions(1);

    cppHttp.query.mockReturnValue(of(mockDtoResponse));

    service.findAvailability(mockParams).subscribe(() => {
      expect(cppHttp.query).toHaveBeenCalledWith({
        url: '/listingcourtscheduler-api/rest/courtscheduler/judiciaries/availability-rules',
        requestType: 'application/json',
        params: expect.any(Object)
      });
    });
  });

  it('should map DTO response to ViewModel correctly', () => {
    expect.assertions(1);

    cppHttp.query.mockReturnValue(of(mockDtoResponse));

    service.findAvailability(mockParams).subscribe((result) => {
      expect(result).toEqual(expectedVMResponse);
    });
  });

  it('should map specialisms from string array to enum array', () => {
    expect.assertions(1);

    cppHttp.query.mockReturnValue(of(mockDtoResponse));

    service.findAvailability(mockParams).subscribe((result) => {
      expect(result.itineraries[0].judiciaryMember.specialisms).toEqual([
        Specialism.MURDER,
        Specialism.ATTEMPTEDMURDER
      ]);
    });
  });

  it('should handle rule without matching specialism', () => {
    expect.assertions(1);

    const dtoWithoutMatchingSpecialism: FindAvailabilityDtoResponse = {
      ...mockDtoResponse,
      judiciaries: [
        {
          ...mockDtoResponse.judiciaries[0],
          specialisms: []
        }
      ]
    };

    cppHttp.query.mockReturnValue(of(dtoWithoutMatchingSpecialism));

    service.findAvailability(mockParams).subscribe((result) => {
      expect(result.itineraries[0].judiciaryMember.specialisms).toEqual([]);
    });
  });

  it('should filter out unknown specialism values', () => {
    expect.assertions(1);

    const dtoWithUnknownSpecialism: FindAvailabilityDtoResponse = {
      ...mockDtoResponse,
      judiciaries: [
        {
          ...mockDtoResponse.judiciaries[0],
          specialisms: ['UNKNOWN_SPECIALISM' as Specialism, Specialism.MURDER]
        }
      ]
    };

    cppHttp.query.mockReturnValue(of(dtoWithUnknownSpecialism));

    service.findAvailability(mockParams).subscribe((result) => {
      expect(result.itineraries[0].judiciaryMember.specialisms).toEqual([Specialism.MURDER]);
    });
  });

  it('should handle rule when judiciary is not found', () => {
    expect.assertions(1);

    const dtoWithoutJudiciary: FindAvailabilityDtoResponse = {
      ...mockDtoResponse,
      judiciaries: []
    };

    cppHttp.query.mockReturnValue(of(dtoWithoutJudiciary));

    service.findAvailability(mockParams).subscribe((result) => {
      expect(result.itineraries[0].judiciaryMember).toEqual(undefined);
    });
  });

  it('should handle rule when judiciary specialisms is undefined', () => {
    expect.assertions(1);

    const dtoWithUndefinedSpecialisms: FindAvailabilityDtoResponse = {
      ...mockDtoResponse,
      judiciaries: [
        {
          ...mockDtoResponse.judiciaries[0],
          specialisms: undefined as any
        }
      ]
    };

    cppHttp.query.mockReturnValue(of(dtoWithUndefinedSpecialisms));

    service.findAvailability(mockParams).subscribe((result) => {
      expect(result.itineraries[0].judiciaryMember.specialisms).toEqual([]);
    });
  });

  it('should preserve all DTO properties in ViewModel', () => {
    expect.assertions(3);

    cppHttp.query.mockReturnValue(of(mockDtoResponse));

    service.findAvailability(mockParams).subscribe((result) => {
      expect(result.totalCount).toBe(mockDtoResponse.totalCount);
      expect(result.pageNumber).toBe(mockDtoResponse.pageNumber);
      expect(result.pageSize).toBe(mockDtoResponse.pageSize);
    });
  });

  it('should call CppHttp.commandSync with correct parameters for addSpecialisms', () => {
    expect.assertions(1);

    const judicialId = 'judge-1';
    const specialisms = [Specialism.MURDER, Specialism.ATTEMPTEDMURDER];
    cppHttp.commandSync.mockReturnValue(of({ specialisms: [] }));

    service.addSpecialisms(judicialId, specialisms).subscribe(() => {
      expect(cppHttp.commandSync).toHaveBeenCalledWith({
        url: `/referencedata-command-api/command/api/rest/referencedata/judiciary-specialisms/${judicialId}`,
        successEvent: 'public.referencedata.event.judiciary-specialisms-updated',
        requestType: 'application/vnd.referencedata.add-judiciary-specialisms+json',
        body: {
          specialisms: specialisms
        }
      });
    });
  });

  it('should call CppHttp.command with correct parameters for addAvailability', () => {
    expect.assertions(1);

    const payload = {
      judiciaryId: 'judge-1',
      courtHouseId: 'court-1',
      repeatDays: ['MONDAY', 'TUESDAY'],
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      sessionType: 'AD' as SessionType
    };
    cppHttp.command.mockReturnValue(of({}));

    service.addAvailability(payload).subscribe(() => {
      expect(cppHttp.command).toHaveBeenCalledWith({
        url: '/listingcourtscheduler-api/rest/courtscheduler/judiciaries/availability-rules/add',
        requestType: 'application/json',
        body: payload
      });
    });
  });

  it('should map repeatDays when repeatDay is an object with day property', () => {
    expect.assertions(1);

    const dtoWithObjectRepeatDays: FindAvailabilityDtoResponse = {
      ...mockDtoResponse,
      rules: [
        {
          ...mockDtoResponse.rules[0],
          repeatDays: ['Monday', 'Tuesday'] as any
        }
      ]
    };

    cppHttp.query.mockReturnValue(of(dtoWithObjectRepeatDays));

    service.findAvailability(mockParams).subscribe((result) => {
      expect(result.itineraries[0].repeatDays).toEqual(['Monday', 'Tuesday']);
    });
  });

  it('should call CppHttp.command with correct parameters for updateAvailability', () => {
    expect.assertions(1);

    const payload = {
      ruleId: 'rule-1',
      judiciaryId: 'judge-1',
      courtHouseId: 'court-1',
      repeatDays: ['MONDAY', 'TUESDAY'],
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      sessionType: 'AD' as SessionType,
      unavailabilities: [] as Unavailability[]
    };
    cppHttp.command.mockReturnValue(of({}));

    service.updateAvailability(payload).subscribe(() => {
      expect(cppHttp.command).toHaveBeenCalledWith({
        url: '/listingcourtscheduler-api/rest/courtscheduler/judiciaries/availability-rules/update',
        requestType: 'application/json',
        body: payload
      });
    });
  });

  it('should call CppHttp.query with correct parameters for findAvailabilityById', () => {
    expect.assertions(1);

    const ruleId = 'rule-123';
    const mockResponse = {
      rule: {
        id: 'rule-123',
        judiciaryId: 'judge-1',
        courtHouseId: 'court-1',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        sessionType: 'AD',
        repeatDays: ['Monday'],
        unavailabilities: [] as Unavailability[]
      },
      judiciary: {
        id: 'judge-1',
        seqId: 1,
        surname: 'Smith',
        forenames: 'John',
        judiciaryType: 'Circuit Judge',
        specialisms: [Specialism.MURDER]
      } as ExtendedJudicialMember
    };

    cppHttp.query.mockReturnValue(of(mockResponse));

    service.findAvailabilityById(ruleId).subscribe(() => {
      expect(cppHttp.query).toHaveBeenCalledWith({
        url: `/listingcourtscheduler-api/rest/courtscheduler/judiciaries/availability-rules/${ruleId}`,
        requestType: 'application/json'
      });
    });
  });

  it('should map findAvailabilityById response correctly', () => {
    expect.assertions(2);

    const ruleId = 'rule-123';
    const mockResponse = {
      rule: {
        id: 'rule-123',
        judiciaryId: 'judge-1',
        courtHouseId: 'court-1',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        sessionType: 'AD',
        repeatDays: ['Monday'],
        unavailabilities: [] as Unavailability[]
      },
      judiciary: {
        id: 'judge-1',
        seqId: 1,
        surname: 'Smith',
        forenames: 'John',
        judiciaryType: 'Circuit Judge',
        specialisms: [Specialism.MURDER, Specialism.ATTEMPTEDMURDER]
      } as ExtendedJudicialMember
    };

    cppHttp.query.mockReturnValue(of(mockResponse));

    service.findAvailabilityById(ruleId).subscribe((result) => {
      expect(result.itinerary.id).toBe('rule-123');
      expect(result.itinerary.judiciaryMember.specialisms).toEqual([
        Specialism.MURDER,
        Specialism.ATTEMPTEDMURDER
      ]);
    });
  });

  it('should filter out unknown specialisms in findAvailabilityById response', () => {
    expect.assertions(1);

    const ruleId = 'rule-123';
    const mockResponse = {
      rule: {
        id: 'rule-123',
        judiciaryId: 'judge-1',
        courtHouseId: 'court-1',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        sessionType: 'AD',
        repeatDays: ['Monday'],
        unavailabilities: [] as Unavailability[]
      },
      judiciary: {
        id: 'judge-1',
        seqId: 1,
        surname: 'Smith',
        forenames: 'John',
        judiciaryType: 'Circuit Judge',
        specialisms: ['UNKNOWN_SPECIALISM' as Specialism, Specialism.MURDER]
      } as ExtendedJudicialMember
    };

    cppHttp.query.mockReturnValue(of(mockResponse));

    service.findAvailabilityById(ruleId).subscribe((result) => {
      expect(result.itinerary.judiciaryMember.specialisms).toEqual([Specialism.MURDER]);
    });
  });

  it('should handle empty specialisms array in findAvailabilityById response', () => {
    expect.assertions(1);

    const ruleId = 'rule-123';
    const mockResponse = {
      rule: {
        id: 'rule-123',
        judiciaryId: 'judge-1',
        courtHouseId: 'court-1',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        sessionType: 'AD',
        repeatDays: ['Monday'],
        unavailabilities: [] as Unavailability[]
      },
      judiciary: {
        id: 'judge-1',
        seqId: 1,
        surname: 'Smith',
        forenames: 'John',
        judiciaryType: 'Circuit Judge',
        specialisms: []
      } as ExtendedJudicialMember
    };

    cppHttp.query.mockReturnValue(of(mockResponse));

    service.findAvailabilityById(ruleId).subscribe((result) => {
      expect(result.itinerary.judiciaryMember.specialisms).toEqual([]);
    });
  });

  it('should handle undefined specialisms in findAvailabilityById response', () => {
    expect.assertions(1);

    const ruleId = 'rule-123';
    const mockResponse = {
      rule: {
        id: 'rule-123',
        judiciaryId: 'judge-1',
        courtHouseId: 'court-1',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        sessionType: 'AD',
        repeatDays: ['Monday'],
        unavailabilities: [] as Unavailability[]
      },
      judiciary: {
        id: 'judge-1',
        seqId: 1,
        surname: 'Smith',
        forenames: 'John',
        judiciaryType: 'Circuit Judge',
        specialisms: undefined
      } as ExtendedJudicialMember
    };

    cppHttp.query.mockReturnValue(of(mockResponse));

    service.findAvailabilityById(ruleId).subscribe((result) => {
      expect(result.itinerary.judiciaryMember.specialisms).toEqual([]);
    });
  });

  it('should call CppHttp.command with correct parameters for validateAvailability', () => {
    expect.assertions(1);

    const payload = {
      judiciaryId: 'judge-1',
      courtHouseId: 'court-1',
      repeatDays: ['MONDAY', 'TUESDAY'],
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      sessionType: 'AD' as SessionType
    };
    cppHttp.command.mockReturnValue(of({}));

    service.validateAvailability(payload).subscribe(() => {
      expect(cppHttp.command).toHaveBeenCalledWith({
        url: '/listingcourtscheduler-api/rest/courtscheduler/judiciaries/availability-rules/validate-add',
        requestType: 'application/json',
        body: payload
      });
    });
  });
});
