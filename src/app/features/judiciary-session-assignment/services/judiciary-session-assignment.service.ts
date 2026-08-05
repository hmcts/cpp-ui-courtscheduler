import { Injectable, inject } from '@angular/core';
import { CppHttp, mapObjectToHttpParams } from '@cpp/core';
import { Observable } from 'rxjs';
import { JudiciaryAssignmentPayload } from '../model/judiciary-assignment-api.model';
import { JudiciarySearchParams } from '../../../shared/model/judiciary-selection.interfaces';
import { ExtendedJudicialMember } from '../../../shared';

@Injectable({ providedIn: 'root' })
export class JudiciarySessionAssignmentService {
  private api = inject(CppHttp);

  assignJudiciaries(payload: JudiciaryAssignmentPayload): Observable<unknown> {
    return this.api.command({
      url: '/listingcourtscheduler-api/rest/courtscheduler/session/assign-judiciary-to-sessions',
      requestType: 'application/vnd.courtscheduler.assign-judiciary-to-sessions+json',
      body: payload
    });
  }
  removeAllJudiciaries(courtScheduleIds: string[]): Observable<unknown> {
    return this.api.command({
      url: '/listingcourtscheduler-api/rest/courtscheduler/session/remove-all-judiciary',
      requestType: 'application/vnd.courtscheduler.remove-all-judiciary+json',
      body: {
        courtScheduleIds
      }
    });
  }

  getAvailableJudiciaries(
    params: JudiciarySearchParams
  ): Observable<{ judiciaries: ExtendedJudicialMember[] }> {
    return this.api.query<{ judiciaries: ExtendedJudicialMember[] }>({
      url: '/listingcourtscheduler-api/rest/courtscheduler/judiciaries/search-available',
      requestType: 'application/vnd.courtscheduler.search.available.judiciaries+json',
      params: mapObjectToHttpParams(params)
    });
  }
}
