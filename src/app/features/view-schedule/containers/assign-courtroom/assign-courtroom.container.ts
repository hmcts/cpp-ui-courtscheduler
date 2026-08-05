import { Component, OnDestroy, OnInit, inject, Signal } from '@angular/core';
import {
  PdkBackLink,
  PdkErrorSummaryComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { CourtScheduleSession } from '../../model/view-schedule.model';
import { map, takeUntil } from 'rxjs/operators';
import { ViewScheduleState } from '../../state/view-schedule.state';
import {
  getErrors,
  getSessionsToAssign,
  getJurisdiction,
  getSearchValues
} from '../../state/selectors/view-schedule.selectors';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { ViewScheduleActions } from '../../state/actions';
import * as sessionCriteria from '../../../../shared/utils/session-criteria.utils';
import { SessionsListComponent } from '../../components/sessions-list/sessions-list.component';
import { AssignCourtroomFormComponent } from '../../components/assign-courtroom-form/assign-courtroom-form.component';
import { CourtRoom } from '../../../../shared/model/court-centre';
import { getCourtCentres } from '../../../../core/selectors/reference-data/reference-data';
import { CourtCentre } from '../../../../shared';
import { SearchFormValues } from '../../model/view-schedule.model';

@Component({
  selector: 'assign-courtroom-container',
  template: `
    @if (errors?.length > 0) {
      <pdk-error-summary [errors]="errors" focusOnChange pdk-margin-top="4" />
    }
    <div pdk-margin-bottom="4">
      <a pdk-back-link (click)="handleBackLink()" href="javascript:void(0);">Back</a>
    </div>
    <pdk-grid container>
      <pdk-grid full>
        <h1 pdk-typography="heading-xlarge">Assign courtroom</h1>

        <sessions-list
          [isAssignView]="true"
          [sessions]="sessionsToAssign"
          [removableSessions]="assignableSessions"
          [ineligibleWithHearings]="ineligibleWithHearings"
          [ineligiblePastSessions]="ineligiblePastSessions"
          [ineligibleAssigned]="ineligibleAssigned"
          [jurisdiction]="jurisdiction()"
        />

        <assign-courtroom-form
          [sessionsToAssignTotal]="assignableSessions.length"
          [courtrooms]="courtrooms"
          (errors)="handleErrors($event)"
          (submitForm)="submitAssignCourtroom($event)"
          (cancelForm)="handleBackLink()"
        />
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [
    PdkBackLink,
    PdkErrorSummaryComponent,
    PdkGrid,
    PdkMarginDirective,
    PdkTypographyDirective,
    SessionsListComponent,
    AssignCourtroomFormComponent
  ]
})
export class AssignCourtroomContainer implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  private viewScheduleStore = inject<Store<ViewScheduleState>>(Store);
  private router = inject(Router);

  errors: ValidationError[] = [];

  sessionsToAssign$: Observable<CourtScheduleSession[]>;
  errors$: Observable<ValidationError[]>;
  courtCentres$: Observable<CourtCentre[]>;
  searchValues$: Observable<SearchFormValues | null>;

  readonly jurisdiction: Signal<JurisdictionType | null> =
    this.viewScheduleStore.selectSignal(getJurisdiction);

  sessionsToAssign: CourtScheduleSession[] = [];
  assignableSessions: CourtScheduleSession[] = [];
  ineligibleWithHearings: CourtScheduleSession[] = [];
  ineligiblePastSessions: CourtScheduleSession[] = [];
  ineligibleAssigned: CourtScheduleSession[] = [];
  courtrooms: CourtRoom[] = [];

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor() {
    this.sessionsToAssign$ = this.viewScheduleStore.select(getSessionsToAssign);
    this.errors$ = this.viewScheduleStore.select(getErrors);
    this.courtCentres$ = this.viewScheduleStore.select(getCourtCentres);
    this.searchValues$ = this.viewScheduleStore.select(getSearchValues);

    this.sessionsToAssign$.pipe(takeUntil(this.destroy$)).subscribe((sessionsToAssign) => {
      this.sessionsToAssign = sessionsToAssign || [];
      const criteriaResult = sessionCriteria.getAssignableSessions(this.sessionsToAssign);
      this.assignableSessions = criteriaResult.eligible;
      this.ineligibleWithHearings = criteriaResult.ineligible.withHearings;
      this.ineligiblePastSessions = criteriaResult.ineligible.past;
      this.ineligibleAssigned = criteriaResult.ineligible.assigned || [];
    });

    this.errors$.pipe(takeUntil(this.destroy$)).subscribe((errors = []) => {
      this.errors = errors;
    });

    combineLatest([this.searchValues$, this.courtCentres$])
      .pipe(
        takeUntil(this.destroy$),
        map(([searchValues, courtCentres]) => {
          if (searchValues?.courtCentre) {
            const courtCentre = courtCentres.find((cc) => cc.id === searchValues.courtCentre.id);
            return courtCentre?.courtRooms || [];
          }
          return [];
        })
      )
      .subscribe((courtrooms) => {
        this.courtrooms = courtrooms;
      });
  }

  ngOnInit(): void {
    this.viewScheduleStore.dispatch(ViewScheduleActions.setErrors({ errors: [] }));
  }

  submitAssignCourtroom(courtroomId: string): void {
    if (!courtroomId || this.assignableSessions.length === 0) {
      this.router.navigate(['..'], { relativeTo: this.route });
      return;
    }

    this.viewScheduleStore.dispatch(
      ViewScheduleActions.assignCourtroom({
        sessionsToAssign: this.assignableSessions,
        courtroomId
      })
    );
  }

  handleBackLink() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  handleErrors(errors: ValidationError[]) {
    this.errors = errors || [];
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
