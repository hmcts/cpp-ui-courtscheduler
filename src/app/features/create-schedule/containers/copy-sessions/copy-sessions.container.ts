import { Component, OnDestroy, OnInit, inject, Signal, viewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { OrganisationUnit, RotaBusinessType } from '@cpp/reference-data';
import {
  PdkBackLink,
  PdkErrorSummaryComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { AddSessionsFormComponent } from '../../components/add-sessions-form/add-sessions-form.component';
import { Session } from '../../../../shared/model/session';
import { CreateScheduleState } from '../../state/create-schedule.state';
import {
  getErrors,
  getJurisdiction,
  getRepeatPattern,
  getSelectedBusinessType,
  getSelectedCourtCentre,
  getSessions,
  getSessionToCopy
} from '../../state/selectors/create-schedule.selectors';
import { CreateScheduleActions } from '../../state/actions';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { AsyncPipe } from '@angular/common';
import { JourneySummaryComponent } from '../../components/journey-summary/journey-summary.component';
import { RepeatPattern } from '../../model/repeat-pattern';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'copy-sessions-container',
  template: `
    @if (errors?.length > 0) {
      <pdk-error-summary [errors]="errors" focusOnChange pdk-margin-top="4" />
    }
    <div pdk-margin-bottom="4">
      <a pdk-back-link (click)="handleBackLink()" href="javascript:void(0);">Back</a>
    </div>
    <pdk-grid container>
      <pdk-grid full>
        <h1 pdk-typography="heading-xlarge">
          Copy sessions for {{ (businessType$ | async)?.typeDescription }}
        </h1>
        <journey-summary
          [courtCentre]="courtCentre$ | async"
          [businessTypeLabel]="(businessType$ | async)?.typeDescription"
        />

        <add-sessions-form
          [initialValues]="sessionToCopy$ | async"
          [courtCentre]="courtCentre$ | async"
          [isSlot]="(businessType$ | async)?.slot"
          [businessType]="businessType$ | async"
          [jurisdiction]="jurisdiction()"
          [repeatPattern]="repeatPattern"
          (errors)="handleErrors($event)"
          (submitForm)="submitSession($event)"
        />
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [
    AsyncPipe,
    PdkBackLink,
    PdkErrorSummaryComponent,
    PdkGrid,
    PdkMarginDirective,
    PdkTypographyDirective,
    AddSessionsFormComponent,
    JourneySummaryComponent
  ]
})
export class CopySessionsContainer implements OnDestroy, OnInit {
  route = inject(ActivatedRoute);
  private store = inject<Store<CreateScheduleState>>(Store);
  private router = inject(Router);

  readonly addSessionComponent = viewChild(AddSessionsFormComponent);

  courtCentre$: Observable<OrganisationUnit>;
  businessType$: Observable<RotaBusinessType>;
  sessionToCopy$: Observable<Session>;

  errors: ValidationError[] = [];
  errors$: Observable<ValidationError[]>;

  destroy$: Subject<boolean> = new Subject<boolean>();

  sessions: Session[];

  readonly jurisdiction: Signal<JurisdictionType | null> = this.store.selectSignal(getJurisdiction);

  repeatPattern: RepeatPattern;

  constructor() {
    this.courtCentre$ = this.store.pipe(select(getSelectedCourtCentre));
    this.businessType$ = this.store.pipe(select(getSelectedBusinessType));
    this.sessionToCopy$ = this.store.pipe(select(getSessionToCopy));
    this.errors$ = this.store.select(getErrors);

    this.store
      .select(getSessions)
      .pipe(takeUntil(this.destroy$))
      .subscribe((sessions) => {
        this.sessions = sessions;
      });

    this.store
      .select(getRepeatPattern)
      .pipe(takeUntil(this.destroy$))
      .subscribe((repeatPattern) => {
        this.repeatPattern = repeatPattern;
      });

    this.errors$.pipe(takeUntil(this.destroy$)).subscribe((errors) => {
      this.errors = [...errors];
      if (!!errors.length) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
  ngOnInit(): void {
    this.store.dispatch(CreateScheduleActions.setErrors({ errors: [] }));
  }

  submitSession(session: Session) {
    this.store.dispatch(
      CreateScheduleActions.copySession({
        existingSessions: this.sessions,
        sessionToBeAdded: { ...session, id: uuid() },
        repeatPattern: this.repeatPattern
      })
    );
  }

  handleBackLink() {
    this.router.navigate([CreateScheduleRoutes.SESSIONS_FORM], { relativeTo: this.route.parent });
  }

  handleErrors(errors: ValidationError[]) {
    this.errors = errors;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
