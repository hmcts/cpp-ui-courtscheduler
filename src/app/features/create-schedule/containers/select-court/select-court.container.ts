import { Component, inject, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganisationUnit } from '@cpp/reference-data';
import {
  PdkErrorSummaryComponent,
  PdkMarginDirective,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { PdkGrid } from '@cpp/pdk';
import { SelectCourtFormComponent } from '../../components/select-court-form/select-court-form.component';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { CreateScheduleActions } from '../../state/actions';
import {
  getSelectedCourtCentre,
  getJurisdiction
} from '../../state/selectors/create-schedule.selectors';
import { CreateScheduleState } from '../../state/create-schedule.state';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

@Component({
  selector: 'select-court-container',
  template: `
    @if (errors?.length > 0) {
      <pdk-error-summary [errors]="errors" focusOnChange pdk-margin-top="4" />
    }
    <pdk-grid container>
      <pdk-grid one-half>
        <h1 pdk-typography="heading-xlarge">Create sessions</h1>
        <select-court-form
          [courtCentre]="initialValues()"
          (courtCentreChange)="submitCourtCentre($event)"
          [jurisdiction]="jurisdiction()"
          (jurisdictionChange)="handleJurisdictionChange($event)"
          (errors)="errors = $event"
        />
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [
    PdkErrorSummaryComponent,
    PdkGrid,
    PdkMarginDirective,
    PdkTypographyDirective,
    SelectCourtFormComponent
  ]
})
export class SelectCourtContainer {
  private store = inject<Store<CreateScheduleState>>(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  initialValues: Signal<OrganisationUnit>;
  jurisdiction: Signal<JurisdictionType | null>;
  errors: ValidationError[] = [];

  constructor() {
    this.initialValues = this.store.selectSignal(getSelectedCourtCentre);
    this.jurisdiction = this.store.selectSignal(getJurisdiction);
  }

  handleJurisdictionChange(jurisdiction: JurisdictionType | null) {
    this.store.dispatch(CreateScheduleActions.setJurisdiction({ jurisdiction }));
  }

  submitCourtCentre(courtCentre: OrganisationUnit) {
    this.store.dispatch(CreateScheduleActions.setCourtCentre({ courtCentre }));

    this.router.navigate([CreateScheduleRoutes.SELECT_BUSINESS_TYPE], {
      relativeTo: this.route.parent
    });
  }
}
