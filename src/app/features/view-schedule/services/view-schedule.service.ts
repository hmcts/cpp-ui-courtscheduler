import { Injectable, inject } from '@angular/core';
import { CppHttp } from '@cpp/core';
import { Observable } from 'rxjs';
import {
  AssignCourtroomErrorGroup,
  CourtScheduleSession,
  SearchSchedulesPayload,
  ViewCourtSchedule
} from '../model/view-schedule.model';
import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable()
export class ViewScheduleService {
  private api = inject(CppHttp);

  searchSchedules = (
    searchSchedulesPayload: SearchSchedulesPayload
  ): Observable<ViewCourtSchedule> => {
    const parsedPayload = {
      ...searchSchedulesPayload,
      pageSize: 100,
      pageNumber: 1
    };
    const params = this.toHttpParams(parsedPayload);

    return this.api.query<ViewCourtSchedule>({
      url: '/listingcourtscheduler-api/rest/courtscheduler/courtschedule',
      requestType: `application/vnd.courtscheduler.get+json`,
      params
    });
  };

  removeSessions = (body: {
    sessions: string[];
  }): Observable<{ sessions: CourtScheduleSession[]; error: string }> => {
    return this.api
      .command({
        url: '/listingcourtscheduler-api/rest/courtscheduler/courtschedule/delete',
        requestType: `application/vnd.courtscheduler.delete+json`,
        body
      })
      .pipe(
        map((response) => {
          const { sessions, error } = JSON.parse(response['body']);

          return { sessions, error };
        })
      );
  };
  updateSession = (body: CourtScheduleSession) => {
    return this.api.command({
      url: '/listingcourtscheduler-api/rest/courtscheduler/courtschedule/edit',
      requestType: `application/vnd.courtscheduler.update+json`,
      body
    });
  };

  assignCourtroom = (body: {
    courtScheduleIds: string[];
    courtRoomId: string;
  }): Observable<{ errorGroups: AssignCourtroomErrorGroup[] }> => {
    return this.api
      .command({
        url: '/listingcourtscheduler-api/rest/courtscheduler/courtschedule/assign.courtroom',
        requestType: `application/vnd.courtscheduler.assign.courtroom+json`,
        body
      })
      .pipe(
        map((response) => {
          const { errorGroups } = JSON.parse(response['body']);
          return { errorGroups };
        })
      );
  };

  private toHttpParams(params: any): HttpParams {
    return Object.getOwnPropertyNames(params)
      .filter((key) => params[key] !== undefined && params[key] !== null)
      .reduce((p, key) => p.set(key, params[key]), new HttpParams());
  }
}
