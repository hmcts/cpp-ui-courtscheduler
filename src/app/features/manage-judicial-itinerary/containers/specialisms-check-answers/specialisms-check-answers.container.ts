import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PdkBackLink, PdkGrid, PdkMarginDirective, PdkTypographyDirective } from '@cpp/pdk';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { createRouterSignals } from '../../../../../shared-signals/router-signals';
import { JudiciaryDetailsComponent } from '../../components/judiciary-details/judiciary-details.component';
import {
  SpecialismAddedConfirmationFormComponent,
  SpecialismAddedConfirmationFormValues
} from '../../components/specialism-added-confirmation-form/specialism-added-confirmation-form.component';

@Component({
  selector: 'specialisms-check-answers-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <a pdk-back-link pdk-margin-top="0" (click)="handleBackLink()" href="javascript:void(0);"
        >Back</a
      >
    </div>

    <h1 pdk-typography="heading-large">Check your answers</h1>

    <judiciary-details
      [selectedType]="store.firstSelectedJudiciaryType()"
      [selectedJudiciary]="store.firstSelectedJudiciary()"
    />

    <specialism-added-confirmation-form
      [draftSpecialisms]="store.draftSpecialisms()"
      [initialValues]="initialFormValues()"
      (errors)="store.setFormErrors($event || [])"
      (submitForm)="handleSubmitForm($event)"
      (onChange)="handleChange()"
    />
  `,
  imports: [
    PdkBackLink,
    PdkGrid,
    PdkMarginDirective,
    PdkTypographyDirective,
    JudiciaryDetailsComponent,
    SpecialismAddedConfirmationFormComponent
  ]
})
export class SpecialismsCheckAnswersContainer {
  readonly store = inject(ManageJudicialItineraryStore);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly location = inject(Location);
  readonly routerSignals = createRouterSignals();

  readonly referrer = computed(() => {
    const queryParams = this.routerSignals.getQueryParams();
    return queryParams?.['referrer'] || null;
  });

  readonly initialFormValues = signal<SpecialismAddedConfirmationFormValues | null>(null);

  handleBackLink(): void {
    this.location.back();
  }

  handleChange(): void {
    this.router.navigate(['../'], {
      relativeTo: this.routerSignals.activatedRoute,
      queryParams: this.routerSignals.getQueryParams()
    });
  }

  handleSubmitForm(values: SpecialismAddedConfirmationFormValues): void {
    const confirmation = values.confirmation;
    const referrer = this.referrer();

    if (confirmation === false) {
      this.store.setDraftSpecialisms([]);
      if (referrer) {
        this.router.navigateByUrl(referrer);
      } else {
        this.handleBackLink();
      }
      return;
    }

    if (confirmation === true) {
      this.store.addSpecialisms({
        referrer: referrer || undefined
      });
    }
  }
}
