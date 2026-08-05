import { Injectable, inject } from '@angular/core';
import { CppHttp, mapObjectToHttpParams } from '@cpp/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Specialism } from '@cpp/reference-data';
import {
  FindAvailabilityDtoResponse,
  FindAvailabilityVM,
  FindAvailabilityParams,
  Itinerary,
  AddAvailabilityPayload,
  UpdateAvailabilityPayload,
  RuleDto
} from '../model/judicial-itinerary.interface';
import { ExtendedJudicialMember } from '../../../shared/model';
@Injectable({ providedIn: 'root' })
export class JudicialItineraryService {
  readonly cppHttp = inject(CppHttp);

  findAvailability(params: FindAvailabilityParams): Observable<FindAvailabilityVM> {
    const mapDtoToViewModel = (dto: FindAvailabilityDtoResponse): FindAvailabilityVM => {
      const itineraries: Itinerary[] = dto.rules.map<Itinerary>(({ judiciaryId, ...ruleRest }) => ({
        ...ruleRest,
        judiciaryMember: dto.judiciaries.find((j) => j.id === judiciaryId)!
      }));

      return {
        itineraries,
        totalCount: dto.totalCount,
        pageNumber: dto.pageNumber,
        pageSize: dto.pageSize
      };
    };
    return this.cppHttp
      .query<FindAvailabilityDtoResponse>({
        url: '/listingcourtscheduler-api/rest/courtscheduler/judiciaries/availability-rules',
        requestType: 'application/json',
        params: mapObjectToHttpParams(params)
      })
      .pipe(map((dtoResponse) => mapDtoToViewModel(dtoResponse)));
  }

  findAvailabilityById(ruleId: string): Observable<{ itinerary: Itinerary }> {
    return this.cppHttp
      .query<{
        rule: RuleDto;
        judiciary: ExtendedJudicialMember;
      }>({
        url: `/listingcourtscheduler-api/rest/courtscheduler/judiciaries/availability-rules/${ruleId}`,
        requestType: 'application/json'
      })
      .pipe(
        map(({ rule, judiciary }) => {
          const { judiciaryId: _judiciaryId, ...ruleRest } = rule;
          return {
            itinerary: {
              ...ruleRest,
              judiciaryMember: judiciary
            }
          };
        })
      );
  }

  addSpecialisms(
    judicialId: string,
    specialisms: Specialism[]
  ): Observable<{ specialisms: Specialism[] }> {
    return this.cppHttp.commandSync<{ specialisms: Specialism[] }>({
      url: `/referencedata-command-api/command/api/rest/referencedata/judiciary-specialisms/${judicialId}`,
      successEvent: 'public.referencedata.event.judiciary-specialisms-updated',
      requestType: 'application/vnd.referencedata.add-judiciary-specialisms+json',
      body: {
        specialisms: specialisms
      }
    });
  }

  addAvailability(payload: AddAvailabilityPayload): Observable<unknown> {
    return this.cppHttp.command({
      url: '/listingcourtscheduler-api/rest/courtscheduler/judiciaries/availability-rules/add',
      requestType: 'application/json',
      body: payload
    });
  }
  validateAvailability(payload: AddAvailabilityPayload): Observable<unknown> {
    return this.cppHttp.command({
      url: '/listingcourtscheduler-api/rest/courtscheduler/judiciaries/availability-rules/validate-add',
      requestType: 'application/json',
      body: payload
    });
  }

  updateAvailability(payload: UpdateAvailabilityPayload): Observable<unknown> {
    return this.cppHttp.command({
      url: '/listingcourtscheduler-api/rest/courtscheduler/judiciaries/availability-rules/update',
      requestType: 'application/json',
      body: payload
    });
  }

  removeAvailability(ruleId: string): Observable<unknown> {
    return this.cppHttp.command({
      url: '/listingcourtscheduler-api/rest/courtscheduler/judiciaries/availability-rules/delete',
      requestType: 'application/json',
      body: {
        ruleId
      }
    });
  }
}
