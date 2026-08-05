import { TestBed } from '@angular/core/testing';
import { ViewScheduleService } from './view-schedule.service';
import { CppHttp } from '@cpp/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { cold } from 'jasmine-marbles';
import { SearchSchedulesPayload, ViewCourtSchedule } from '../model/view-schedule.model';
import { mockCourtScheduleResponse, mockSearchSchedulesPayload } from '../../../shared';

describe('ViewScheduleService', () => {
  let service: ViewScheduleService;
  let api: CppHttp;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ViewScheduleService,
        {
          provide: CppHttp,
          useValue: {
            query: jest.fn(),
            command: jest.fn()
          }
        }
      ]
    });

    service = TestBed.inject(ViewScheduleService);
    api = TestBed.inject(CppHttp);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call api.query with correct parameters when searchSchedules is called', () => {
    const searchSchedulesPayload: SearchSchedulesPayload = mockSearchSchedulesPayload;
    const response: ViewCourtSchedule = mockCourtScheduleResponse;

    const params = new HttpParams()
      .set('sessionStartDate', searchSchedulesPayload.sessionStartDate)
      .set('sessionEndDate', searchSchedulesPayload.sessionEndDate)
      .set('courtCentreId', searchSchedulesPayload.courtCentreId)
      .set('businessType', searchSchedulesPayload.businessType)
      .set('courtRoomId', searchSchedulesPayload.courtRoomId)
      .set('pageSize', 100)
      .set('pageNumber', 1);

    api.query = jasmine.createSpy('searchCourtSchedule').and.returnValue(of(response));

    const expected = cold('(a|)', { a: response });
    const result = service.searchSchedules(searchSchedulesPayload);

    expect(result).toBeObservable(expected);
    expect(api.query).toHaveBeenCalledWith({
      url: '/listingcourtscheduler-api/rest/courtscheduler/courtschedule',
      requestType: 'application/vnd.courtscheduler.get+json',
      params
    });
  });

  it('should convert searchSchedulesPayload to HttpParams correctly', () => {
    const searchSchedulesPayload: SearchSchedulesPayload = mockSearchSchedulesPayload;
    const params = service['toHttpParams'](searchSchedulesPayload);

    expect(params.get('sessionStartDate')).toBe(searchSchedulesPayload.sessionStartDate);
    expect(params.get('sessionEndDate')).toBe(searchSchedulesPayload.sessionEndDate);
    expect(params.get('courtCentreId')).toBe(searchSchedulesPayload.courtCentreId);
    expect(params.get('businessType')).toBe(searchSchedulesPayload.businessType);
    expect(params.get('courtRoomId')).toBe(searchSchedulesPayload.courtRoomId);
  });

  it('should call api.command with correct parameters when removeSessions is called', () => {
    const sessionsToRemovePayload = { sessions: ['id'] };
    const responseBody = { sessions: [{ id: 'id', name: 'Session 1' }], error: '' };
    const response = new HttpResponse({ status: 202, body: JSON.stringify(responseBody) });

    api.command = jasmine.createSpy('removeCourtSchedule').and.returnValue(of(response));

    const expected = cold('(a|)', { a: responseBody });
    const result = service.removeSessions(sessionsToRemovePayload);

    expect(result).toBeObservable(expected);
    expect(api.command).toHaveBeenCalledWith({
      url: '/listingcourtscheduler-api/rest/courtscheduler/courtschedule/delete',
      requestType: 'application/vnd.courtscheduler.delete+json',
      body: sessionsToRemovePayload
    });
  });

  it('should call api.command with correct parameters when assignCourtroom is called', () => {
    const assignCourtroomPayload = { courtScheduleIds: ['id1', 'id2'], courtRoomId: 'courtroom-1' };
    const responseBody = { errorGroups: [] as unknown[] };
    const response = new HttpResponse({ status: 202, body: JSON.stringify(responseBody) });

    api.command = jasmine.createSpy('assignCourtroom').and.returnValue(of(response));

    const expected = cold('(a|)', { a: responseBody });
    const result = service.assignCourtroom(assignCourtroomPayload);

    expect(result).toBeObservable(expected);
    expect(api.command).toHaveBeenCalledWith({
      url: '/listingcourtscheduler-api/rest/courtscheduler/courtschedule/assign.courtroom',
      requestType: 'application/vnd.courtscheduler.assign.courtroom+json',
      body: assignCourtroomPayload
    });
  });
});
