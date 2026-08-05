import { Component, OnInit, inject, Signal } from '@angular/core';
import {
  PdkErrorSummaryComponent,
  PdkGrid,
  PdkInsetTextComponent,
  PdkMarginDirective,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import { SearchFormComponent } from '../../components/search-form/search-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CourtroomListComponent } from '../../components/courtroom-list/courtroom-list.component';
import { AsyncPipe } from '@angular/common';
import { ViewScheduleActions } from '../../state/actions';
import {
  BulkActionType,
  BulkActionPayload,
  CourtSchedule,
  CourtScheduleSession,
  SearchFormValues
} from '../../model/view-schedule.model';
import { ViewScheduleState } from '../../state/view-schedule.state';
import {
  getActiveCourtroomsIndexes,
  getBannerMessage,
  getCourtSchedules,
  getJurisdiction,
  getSearchValues
} from '../../state/selectors/view-schedule.selectors';
import { ViewScheduleRoutes } from '../../view-schedule.routes';
import { BannerMessage } from '../../../../shared/model/banner-message';
import { tap } from 'rxjs/operators';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

@Component({
  selector: 'search-container',
  template: `
    @if (errors?.length > 0) {
      <pdk-error-summary [errors]="errors" focusOnChange pdk-margin-top="4" />
    }
    <pdk-grid container>
      <pdk-grid full>
        <h1 pdk-typography="heading-xlarge">View or edit court sessions</h1>
        <search-form
          [initialValues]="searchValues$ | async"
          [jurisdiction]="jurisdiction()"
          (jurisdictionChange)="handleJurisdictionChange($event)"
          (errors)="errors = $event"
          (submitForm)="searchValues($event)"
        />
        @if (searchValues$ | async) {
          <pdk-inset-text data-test-id="totalSessions">
            {{ getTotalSessions(courtSchedules$ | async) }} session(s) found
          </pdk-inset-text>
        }

        @if ((courtSchedules$ | async).length > 0) {
          <courtroom-list
            [courtSchedules]="courtSchedules$ | async"
            [bannerMessage]="bannerMessage$ | async"
            [activeCourtroomsIndexes]="activeCourtroomsIndexes$ | async"
            [jurisdiction]="jurisdiction()"
            (submitForm)="handleBulkAction($event)"
            (setSessionToEdit)="handleEdit($event)"
            (setActiveCourtroomsIndexes)="handleActiveCourtroomsIndexes($event)"
            (validationErrors)="handleValidationErrors($event)"
          />
        }
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [
    AsyncPipe,
    PdkErrorSummaryComponent,
    PdkGrid,
    PdkInsetTextComponent,
    PdkMarginDirective,
    PdkTypographyDirective,
    CourtroomListComponent,
    SearchFormComponent
  ]
})
export class SearchContainer implements OnInit {
  route = inject(ActivatedRoute);
  private store = inject<Store<ViewScheduleState>>(Store);
  private router = inject(Router);

  courtSchedules$: Observable<CourtSchedule[]>;
  searchValues$: Observable<SearchFormValues>;
  bannerMessage$: Observable<BannerMessage>;
  activeCourtroomsIndexes$: Observable<number[]>;
  errors: ValidationError[] = [];
  readonly jurisdiction: Signal<JurisdictionType | null>;

  constructor() {
    this.courtSchedules$ = this.store.select(getCourtSchedules);
    this.searchValues$ = this.store.select(getSearchValues);
    this.bannerMessage$ = this.store.select(getBannerMessage);
    this.activeCourtroomsIndexes$ = this.store.select(getActiveCourtroomsIndexes);
    this.jurisdiction = this.store.selectSignal(getJurisdiction);
  }

  handleJurisdictionChange(jurisdiction: JurisdictionType | null) {
    this.store.dispatch(ViewScheduleActions.setJurisdiction({ jurisdiction }));
  }

  ngOnInit(): void {
    this.searchValues$
      .pipe(
        filter((searchFormValues) => searchFormValues !== null),
        tap((searchFormValues) => {
          this.store.dispatch(
            ViewScheduleActions.searchSchedules({
              searchFormValues
            })
          );
        })
      )
      .subscribe();
  }

  searchValues(searchFormValues: SearchFormValues) {
    this.store.dispatch(
      ViewScheduleActions.searchSchedules({
        searchFormValues
      })
    );
  }

  handleBulkAction(payload: BulkActionPayload) {
    if (payload.action === BulkActionType.REMOVE) {
      this.store.dispatch(
        ViewScheduleActions.setViewSessionsToRemove({
          sessionsToRemove: payload.sessions
        })
      );
      this.router.navigate([ViewScheduleRoutes.REMOVE_SESSIONS], {
        relativeTo: this.route.parent
      });
    } else if (payload.action === BulkActionType.ASSIGN) {
      this.store.dispatch(
        ViewScheduleActions.setViewSessionsToAssign({
          sessionsToAssign: payload.sessions
        })
      );
      this.router.navigate([ViewScheduleRoutes.ASSIGN_COURTROOM], {
        relativeTo: this.route.parent
      });
    }
  }

  getTotalSessions(courtSchedules: CourtSchedule[]): number {
    return courtSchedules.reduce((acc, cur) => acc + cur.sessions.length, 0);
  }

  handleEdit(session: CourtScheduleSession) {
    this.store.dispatch(
      ViewScheduleActions.setSessionToEdit({
        session
      })
    );
    this.router.navigate([ViewScheduleRoutes.EDIT], { relativeTo: this.route.parent });
  }

  handleActiveCourtroomsIndexes(activeCourtroomsIndexes: number[]) {
    this.store.dispatch(
      ViewScheduleActions.setActiveCourtroomsIndexes({
        activeCourtroomsIndexes
      })
    );
  }

  handleValidationErrors(errors: ValidationError[]): void {
    this.errors = errors;
  }
}
