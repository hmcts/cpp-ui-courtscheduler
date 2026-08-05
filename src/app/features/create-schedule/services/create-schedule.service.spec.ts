import { CreateScheduleService } from './create-schedule.service';
import { CppHttp } from '@cpp/core';
import { TestBed } from '@angular/core/testing';
import { CourtSchedulePayload, ValidateSessionPayload } from '../model';
import { mockCourtSchedulePayload, mockValidateSessionPayload } from '../../../shared';
import { HttpResponse } from '@angular/common/http';
import { cold } from 'jasmine-marbles';

describe('CreateScheduleService', () => {
  let service: CreateScheduleService;
  let api: CppHttp;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CreateScheduleService,
        {
          provide: CppHttp,
          useValue: {
            command: jest.fn()
          }
        }
      ]
    });

    service = TestBed.inject(CreateScheduleService);
    api = TestBed.inject(CppHttp);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call api.command with correct parameters when createCourtSchedule is called', () => {
    const courtSchedulePayload: CourtSchedulePayload = mockCourtSchedulePayload;
    const response = new HttpResponse({ status: 202 });

    const response$ = cold('-a|', { a: response });
    const expected$ = cold('-b|', { b: response });

    api.command = jasmine.createSpy('createCourtSchedule').and.returnValue(response$);

    expect(service.createCourtSchedule(courtSchedulePayload)).toBeObservable(expected$);

    expect(api.command).toHaveBeenCalledWith({
      url: '/listingcourtscheduler-api/rest/courtscheduler/courtschedule',
      requestType: 'application/vnd.courtscheduler.create+json',
      body: { ...courtSchedulePayload }
    });
  });

  it('should call api.command with correct parameters when validateSession is called', () => {
    const validateSession: ValidateSessionPayload = mockValidateSessionPayload;
    const response = new HttpResponse({ status: 200 });

    const response$ = cold('-a|', { a: response });
    const expected$ = cold('-b|', { b: response });

    api.command = jasmine.createSpy('validateSession').and.returnValue(response$);

    expect(service.validateSession(validateSession)).toBeObservable(expected$);

    expect(api.command).toHaveBeenCalledWith({
      url: '/listingcourtscheduler-api/rest/courtscheduler/validate',
      requestType: 'application/vnd.courtscheduler.validate.create+json',
      body: { ...validateSession }
    });
  });
});
