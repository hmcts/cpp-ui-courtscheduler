import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CppHttp } from '@cpp/core';
import { JudiciarySessionAssignmentService } from '../judiciary-session-assignment.service';
import type { JudiciaryAssignmentPayload } from '../../model/judiciary-assignment-api.model';

describe('JudiciarySessionAssignmentService', () => {
  let service: JudiciarySessionAssignmentService;
  let cppHttp: jest.Mocked<CppHttp>;

  beforeEach(() => {
    cppHttp = {
      command: jest.fn().mockReturnValue(of({})),
      query: jest.fn().mockReturnValue(of({ judiciaries: [] }))
    } as unknown as jest.Mocked<CppHttp>;

    TestBed.configureTestingModule({
      providers: [JudiciarySessionAssignmentService, { provide: CppHttp, useValue: cppHttp }]
    });

    service = TestBed.inject(JudiciarySessionAssignmentService);
  });

  it('should call command for assignJudiciaries', () => {
    expect.assertions(2);
    const payload: JudiciaryAssignmentPayload = {
      courtScheduleIds: ['s1'],
      judiciary: []
    };
    service.assignJudiciaries(payload).subscribe();
    expect(cppHttp.command).toHaveBeenCalledWith({
      url: '/listingcourtscheduler-api/rest/courtscheduler/session/assign-judiciary-to-sessions',
      requestType: 'application/vnd.courtscheduler.assign-judiciary-to-sessions+json',
      body: payload
    });
    expect(cppHttp.command).toHaveBeenCalledTimes(1);
  });

  it('should call command for removeAllJudiciaries', () => {
    expect.assertions(2);
    const courtScheduleIds = ['court-schedule-1', 'court-schedule-2'];
    service.removeAllJudiciaries(courtScheduleIds).subscribe();
    expect(cppHttp.command).toHaveBeenCalledWith({
      url: '/listingcourtscheduler-api/rest/courtscheduler/session/remove-all-judiciary',
      requestType: 'application/vnd.courtscheduler.remove-all-judiciary+json',
      body: { courtScheduleIds }
    });
    expect(cppHttp.command).toHaveBeenCalledTimes(1);
  });

  it('should call query for getAvailableJudiciaries', () => {
    expect.assertions(2);
    const params = {
      judiciaryGroup: 'Judge' as const,
      search: 'a',
      limit: 10,
      dates: '2026-01-01',
      courtHouseId: 'court-1'
    };
    service.getAvailableJudiciaries(params).subscribe();
    expect(cppHttp.query).toHaveBeenCalled();
    expect(cppHttp.query).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/listingcourtscheduler-api/rest/courtscheduler/judiciaries/search-available',
        requestType: 'application/vnd.courtscheduler.search.available.judiciaries+json'
      })
    );
  });
});
