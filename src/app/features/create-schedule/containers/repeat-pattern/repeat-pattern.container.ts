import { Component, inject } from '@angular/core';
import { OrganisationUnit, RotaBusinessType } from '@cpp/reference-data';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import {
  PdkBackLink,
  PdkErrorSummaryComponent,
  PdkMarginDirective,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { PdkGrid } from '@cpp/pdk';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateScheduleState } from '../../state/create-schedule.state';
import {
  getRepeatPattern,
  getSelectedBusinessType,
  getSelectedCourtCentre
} from '../../state/selectors/create-schedule.selectors';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { CreateScheduleActions } from '../../state/actions';
import { RepeatPattern } from '../../model/repeat-pattern';
import { JourneySummaryComponent } from '../../components/journey-summary/journey-summary.component';
import { AsyncPipe } from '@angular/common';
import { RepeatPatternFormComponent } from '../../components/repeat-pattern-form/repeat-pattern-form.component';
@Component({
  selector: 'repeat-pattern-container',
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
          Sessions for {{ (businessType$ | async)?.typeDescription }}
        </h1>
        <journey-summary
          [courtCentre]="courtCentre$ | async"
          [businessTypeLabel]="(businessType$ | async)?.typeDescription"
        />
        <repeat-pattern-form
          [initialValues]="initialValues$ | async"
          (errors)="errors = $event"
          (submitForm)="submitRepeatPattern($event)"
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
    JourneySummaryComponent,
    RepeatPatternFormComponent
  ]
})
export class RepeatPatternContainer {
  private store = inject<Store<CreateScheduleState>>(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  courtCentre$: Observable<OrganisationUnit>;
  businessType$: Observable<RotaBusinessType>;
  initialValues$: Observable<RepeatPattern>;

  errors: ValidationError[] = [];

  constructor() {
    this.courtCentre$ = this.store.pipe(select(getSelectedCourtCentre));
    this.businessType$ = this.store.pipe(select(getSelectedBusinessType));
    this.initialValues$ = this.store.pipe(select(getRepeatPattern));
  }

  handleBackLink() {
    this.router.navigate([CreateScheduleRoutes.SELECT_BUSINESS_TYPE], {
      relativeTo: this.route.parent
    });
  }

  submitRepeatPattern(newRepeatPattern: RepeatPattern) {
    this.store.pipe(select(getRepeatPattern), take(1)).subscribe((currentRepeatPattern) => {
      const hasRepeatPatternChanged = !isEqual(currentRepeatPattern, newRepeatPattern);

      if (hasRepeatPatternChanged) {
        this.store.dispatch(CreateScheduleActions.clearSessions());

        this.store.dispatch(
          CreateScheduleActions.setRepeatPattern({
            repeatPattern: newRepeatPattern
          })
        );
      }

      this.router.navigate([CreateScheduleRoutes.SESSIONS_FORM], {
        relativeTo: this.route.parent
      });
    });
  }
}
