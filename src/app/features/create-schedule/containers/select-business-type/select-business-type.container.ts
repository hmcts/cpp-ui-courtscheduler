import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getRotaBusinessTypesByJurisdiction, RotaBusinessTypeCode } from '@cpp/reference-data';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import {
  PdkBackLink,
  PdkErrorSummaryComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { SelectBusinessTypeFormComponent } from '../../components/select-business-type-form/select-business-type-form.component';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import {
  getSelectedBusinessType,
  getSelectedCourtCentre,
  getJurisdiction
} from '../../state/selectors/create-schedule.selectors';
import { CreateScheduleActions } from '../../state/actions';
import { CreateScheduleState } from '../../state/create-schedule.state';
import { JourneySummaryComponent } from '../../components/journey-summary/journey-summary.component';

@Component({
  selector: 'select-business-type-container',
  template: `
    @if (errors?.length > 0) {
      <pdk-error-summary [errors]="errors" pdk-margin-top="4" focusOnChange />
    }
    <div pdk-margin-bottom="4">
      <a pdk-back-link (click)="handleBackLink()" href="javascript:void(0);">Back </a>
    </div>
    <pdk-grid container>
      <pdk-grid full>
        <h1 pdk-typography="heading-xlarge">Select business type</h1>
        <journey-summary
          [courtCentre]="courtCentre()"
          [businessTypeLabel]="businessTypeLabel()"
          headingText="Court details"
        />
      </pdk-grid>
      <pdk-grid one-half>
        <select-business-type-form
          [courtCentre]="courtCentre()"
          [initialValues]="initialValues()"
          [jurisdiction]="jurisdiction()"
          (errors)="errors = $event"
          (submitForm)="submitBusinessType($event)"
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
    JourneySummaryComponent,
    SelectBusinessTypeFormComponent
  ]
})
export class SelectBusinessTypeContainer {
  private store = inject<Store<CreateScheduleState>>(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly courtCentre = this.store.selectSignal(getSelectedCourtCentre);
  readonly initialValues = this.store.selectSignal(getSelectedBusinessType);
  readonly selectedBusinessType = this.store.selectSignal(getSelectedBusinessType);
  readonly businessTypeLabel = computed(() => this.selectedBusinessType()?.typeDescription);
  readonly jurisdiction = this.store.selectSignal(getJurisdiction);
  readonly businessTypes = computed(() => {
    const jurisdiction = this.jurisdiction();
    if (!jurisdiction) {
      return [];
    }
    return this.store.selectSignal(getRotaBusinessTypesByJurisdiction(jurisdiction))();
  });

  readonly findBusinessTypeByCode = (code: RotaBusinessTypeCode) =>
    this.businessTypes()?.find((bt) => bt.typeCode === code);

  errors: ValidationError[] = [];

  submitBusinessType(businessTypeCode: RotaBusinessTypeCode) {
    const businessType = this.findBusinessTypeByCode(businessTypeCode);

    if (!businessType) {
      return;
    }

    const currentBusinessType = this.selectedBusinessType();
    const hasBusinessTypeChanged = !isEqual(currentBusinessType, businessType);

    if (hasBusinessTypeChanged) {
      this.store.dispatch(CreateScheduleActions.clearSessions());
      this.store.dispatch(CreateScheduleActions.setBusinessType({ businessType }));
    }

    this.router.navigate([CreateScheduleRoutes.REPEAT_PATTERN], {
      relativeTo: this.route.parent
    });
  }

  handleBackLink() {
    this.router.navigate([CreateScheduleRoutes.SELECT_COURT], { relativeTo: this.route.parent });
  }
}
