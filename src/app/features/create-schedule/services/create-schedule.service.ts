import { CppHttp } from '@cpp/core';
import { Injectable, inject } from '@angular/core';
import { CourtSchedulePayload, ValidateSessionPayload } from '../model';
import { Observable } from 'rxjs';

@Injectable()
export class CreateScheduleService {
  private api = inject(CppHttp);

  createCourtSchedule(courtSchedulePayload: CourtSchedulePayload): Observable<unknown> {
    const body = { ...courtSchedulePayload };
    return this.api.command({
      url: '/listingcourtscheduler-api/rest/courtscheduler/courtschedule',
      requestType: 'application/vnd.courtscheduler.create+json',
      body
    });
  }

  validateSession(validateSession: ValidateSessionPayload): Observable<unknown> {
    const body = { ...validateSession };
    return this.api.command({
      url: '/listingcourtscheduler-api/rest/courtscheduler/validate',
      requestType: 'application/vnd.courtscheduler.validate.create+json',
      body
    });
  }
}
