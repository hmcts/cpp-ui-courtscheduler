import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  PdkBackLink,
  PdkErrorSummaryComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { CourtCentre } from '../../../../shared';
import { CourtScheduleSession } from '../../model/view-schedule.model';
import { ViewScheduleState } from '../../state/view-schedule.state';
import { getCourtCentres } from '../../../../core/selectors/reference-data/reference-data';
import {
  getErrors,
  getJurisdiction,
  getSessionToEdit
} from '../../state/selectors/view-schedule.selectors';
import { ViewScheduleActions } from '../../state/actions';
import { ViewScheduleRoutes } from '../../view-schedule.routes';
import { EditSessionComponent } from '../../components/edit-form/edit-form.component';
import { AsyncPipe } from '@angular/common';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'edit-session',
  template: `
    @if (errors?.length > 0) {
      <pdk-error-summary [errors]="errors" focusOnChange pdk-margin-top="4" />
    }
    <div pdk-margin-bottom="4">
      <a pdk-back-link (click)="handleBackLink()" href="javascript:void(0);">Back</a>
    </div>
    <pdk-grid container>
      <pdk-grid full>
        <h1 pdk-typography="heading-xlarge">Edit session</h1>
        <edit-sessions-form
          [courtCentres]="courtCentres$ | async"
          [sessionToEdit]="sessionToEdit$ | async"
          [jurisdiction]="jurisdiction()"
          (submitForm)="handleSubmitForm($event)"
          (handleBackNav)="handleBackLink()"
          (errors)="errors = $event"
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
    EditSessionComponent
  ]
})
export class EditSessionContainer implements OnInit, OnDestroy {
  private store = inject<Store<ViewScheduleState>>(Store);
  private router = inject(Router);
  courtCentres$: Observable<CourtCentre[]>;
  sessionToEdit$: Observable<CourtScheduleSession>;
  sessionToCopy: CourtScheduleSession;
  errors: ValidationError[] = [];
  errors$: Observable<ValidationError[]>;
  readonly jurisdiction = toSignal(this.store.select(getJurisdiction), { initialValue: null });
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor() {
    this.courtCentres$ = this.store.select(getCourtCentres);
    this.sessionToEdit$ = this.store.select(getSessionToEdit);
    this.errors$ = this.store.select(getErrors);

    this.errors$.pipe(takeUntil(this.destroy$)).subscribe((errors) => {
      this.errors = [...errors];
    });
  }

  handleSubmitForm(session: CourtScheduleSession) {
    this.store.dispatch(ViewScheduleActions.updateSession({ session }));
  }

  handleBackLink() {
    this.router.navigate([ViewScheduleRoutes.VIEW]);
  }

  ngOnInit(): void {
    this.store.dispatch(ViewScheduleActions.setErrors({ errors: [] }));
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
