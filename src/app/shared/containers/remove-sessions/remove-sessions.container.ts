import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  PdkBackLink,
  PdkErrorSummaryComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { ActivatedRoute } from '@angular/router';
import { SessionDetailsComponent } from '../../../features/create-schedule/components/session-details/session-details.component';
import { Session } from '../../model/session';
import { Location, NgPlural, NgPluralCase } from '@angular/common';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { CreateScheduleState } from '../../../features/create-schedule/state/create-schedule.state';
import { RemoveSessionsFormComponent } from '../../components/remove-sessions-form/remove-sessions-form.component';
import { CourtScheduleSession } from '../../../features/view-schedule/model/view-schedule.model';
import { map, takeUntil } from 'rxjs/operators';
import {
  getSelectedCourtCentre,
  getSessionsToRemove as createGetSessionsToRemove
} from '../../../features/create-schedule/state/selectors/create-schedule.selectors';
import { ViewScheduleState } from '../../../features/view-schedule/state/view-schedule.state';
import {
  getErrors,
  getSessionsToRemove as viewGetSessionsToRemove
} from '../../../features/view-schedule/state/selectors/view-schedule.selectors';
import { ViewScheduleActions } from '../../../features/view-schedule/state/actions';
import { CreateScheduleActions } from '../../../features/create-schedule/state/actions';
import * as sessionCriteria from '../../utils/session-criteria.utils';
import { SessionsListComponent } from '../../../features/view-schedule/components/sessions-list/sessions-list.component';

@Component({
  selector: 'remove-sessions-container',
  template: `
    @if (errors?.length > 0) {
      <pdk-error-summary [errors]="errors" focusOnChange pdk-margin-top="4" />
    }
    <div pdk-margin-bottom="4">
      <a pdk-back-link (click)="handleBackLink()" href="javascript:void(0);">Back</a>
    </div>
    <pdk-grid container>
      <pdk-grid full>
        <h1 pdk-typography="heading-xlarge" [ngPlural]="sessionsToRemove.length">
          Remove
          <ng-template ngPluralCase="=1"> session</ng-template>
          <ng-template ngPluralCase="other"> sessions</ng-template>
        </h1>

        @if (isCreateJourney) {
          <session-details [sessions]="sessionsToRemove" [defaultStartTime]="defaultStartTime" />
        }
        @if (isViewJourney) {
          <sessions-list
            [isDeleteView]="true"
            [sessions]="sessionsToRemove"
            [removableSessions]="removableSessions"
            [ineligibleWithHearings]="ineligibleWithHearings"
            [ineligiblePastSessions]="ineligiblePastSessions"
          />
        }

        <remove-sessions-form
          [sessionsToRemoveTotal]="this.sessionsToRemoveTotal"
          (errors)="handleErrors($event)"
          (submitForm)="submitRemoveSessions($event)"
          (cancelForm)="handleBackLink()"
        />
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [
    NgPlural,
    NgPluralCase,
    PdkBackLink,
    PdkErrorSummaryComponent,
    PdkGrid,
    PdkMarginDirective,
    PdkTypographyDirective,
    RemoveSessionsFormComponent,
    SessionDetailsComponent,
    SessionsListComponent
  ]
})
export class RemoveSessionsContainer implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  private createScheduleStore = inject<Store<CreateScheduleState>>(Store);
  private viewScheduleStore = inject<Store<ViewScheduleState>>(Store);
  private location = inject(Location);

  errors: ValidationError[] = [];

  sessions$: Observable<Session[] | CourtScheduleSession[]>;
  courtScheduleSessions$: Observable<Session[] | CourtScheduleSession[]>;
  errors$: Observable<ValidationError[]>;

  sessionsToRemove$: Observable<Session[] | CourtScheduleSession[]>;
  sessionsToRemove: Session[] | CourtScheduleSession[] = [];

  removableSessions: CourtScheduleSession[] = [];
  ineligibleWithHearings: CourtScheduleSession[] = [];
  ineligiblePastSessions: CourtScheduleSession[] = [];

  sessionsToRemoveTotal: number = 0;

  isCreateJourney: boolean;
  isViewJourney: boolean;
  defaultStartTime: string;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor() {
    this.createScheduleStore
      .select(getSelectedCourtCentre)
      .pipe(takeUntil(this.destroy$))
      .subscribe((courtCentre) => {
        this.defaultStartTime = courtCentre?.defaultStartTime;
      });

    this.sessions$ = this.createScheduleStore.select(createGetSessionsToRemove);
    this.courtScheduleSessions$ = this.viewScheduleStore.select(viewGetSessionsToRemove);
    this.errors$ = this.viewScheduleStore.select(getErrors);

    this.isCreateJourney = !!this.route.snapshot.data['isCreateJourney'];
    this.isViewJourney = !!this.route.snapshot.data['isViewJourney'];

    /*
     * This observable combines sessions from both the CREATE and VIEW journeys.
     * Only one of these journeys will have sessions at any given time.
     *
     * sessions$ - Draft sessions from CREATE journey.
     * courtScheduleSessions - Already persisted sessions from VIEW journey.
     *
     * sessionsToRemove$ will have sessions whichever is currently active and populated.
     */

    this.sessionsToRemove$ = combineLatest([this.sessions$, this.courtScheduleSessions$]).pipe(
      map(([sessions, courtScheduleSessions]) => {
        return sessions && sessions.length > 0 ? sessions : courtScheduleSessions;
      })
    );

    this.sessionsToRemove$.pipe(takeUntil(this.destroy$)).subscribe((sessionsToRemove) => {
      this.sessionsToRemove = sessionsToRemove;
      this.sessionsToRemoveTotal = this.sessionsToRemove.length;
      if (this.isViewJourney && this.sessionsToRemove.length > 0) {
        const criteriaResult = sessionCriteria.getRemovableSessions(
          sessionsToRemove as CourtScheduleSession[]
        );
        this.removableSessions = criteriaResult.eligible;
        this.ineligibleWithHearings = criteriaResult.ineligible.withHearings;
        this.ineligiblePastSessions = criteriaResult.ineligible.past;
        this.sessionsToRemoveTotal = this.removableSessions.length;
      }
    });

    this.errors$.pipe(takeUntil(this.destroy$)).subscribe((errors = []) => {
      this.errors = [...errors];
    });
  }

  ngOnInit(): void {
    this.viewScheduleStore.dispatch(ViewScheduleActions.setErrors({ errors: [] }));
  }

  submitRemoveSessions(removeConfirmation: boolean) {
    if (!removeConfirmation) {
      return this.location.back();
    }
    if (this.isViewJourney) {
      this.viewScheduleStore.dispatch(
        ViewScheduleActions.removeSessions({
          sessionsToRemove: this.removableSessions as CourtScheduleSession[]
        })
      );
    } else {
      this.createScheduleStore.dispatch(
        CreateScheduleActions.removeSession({
          sessions: this.sessionsToRemove as Session[]
        })
      );
    }
  }

  handleBackLink() {
    this.location.back();
  }

  handleErrors(errors: ValidationError[]) {
    this.errors = errors;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
