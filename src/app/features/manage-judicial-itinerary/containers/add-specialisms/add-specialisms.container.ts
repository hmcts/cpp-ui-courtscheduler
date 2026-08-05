import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { PdkBackLink, PdkMarginDirective, PdkTypographyDirective } from '@cpp/pdk';
import {
  AddSpecialismsFormComponent,
  AddSpecialismsFormValues
} from '../../components/add-specialisms-form/add-specialisms-form.component';
import { JudiciaryDetailsComponent } from '../../components/judiciary-details/judiciary-details.component';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { createRouterSignals } from '../../../../../shared-signals/router-signals';

@Component({
  selector: 'add-specialisms-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let judiciary = store.firstSelectedJudiciary();
    <div>
      <a pdk-back-link pdk-margin-top="0" (click)="handleBackLink()" href="javascript:void(0);"
        >Back</a
      >
    </div>

    <h1 pdk-typography="heading-large">Add new specialism</h1>

    <judiciary-details
      [selectedType]="store.firstSelectedJudiciaryType()"
      [selectedJudiciary]="judiciary"
    />

    <add-specialisms-form
      [existingSpecialisms]="judiciary?.specialisms ?? []"
      [initialValues]="initialFormValues()"
      (errors)="store.setFormErrors($event || [])"
      (submitForm)="handleSubmitForm($event)"
    />
  `,
  imports: [
    PdkBackLink,
    PdkMarginDirective,
    PdkTypographyDirective,
    JudiciaryDetailsComponent,
    AddSpecialismsFormComponent
  ]
})
export class AddSpecialismsContainer {
  readonly store = inject(ManageJudicialItineraryStore);
  readonly router = inject(Router);
  readonly location = inject(Location);
  readonly routerSignals = createRouterSignals();

  readonly initialFormValues = computed<AddSpecialismsFormValues>(() => ({
    selectedSpecialisms: this.store.draftSpecialisms()
  }));

  handleBackLink(): void {
    this.location.back();
    this.store.resetJudiciarySpecialismsState();
  }

  handleSubmitForm(values: AddSpecialismsFormValues): void {
    this.store.setDraftSpecialisms(values.selectedSpecialisms);

    this.router.navigate(['specialism-check-answers'], {
      relativeTo: this.routerSignals.activatedRoute,
      queryParams: this.routerSignals.getQueryParams()
    });
  }
}
